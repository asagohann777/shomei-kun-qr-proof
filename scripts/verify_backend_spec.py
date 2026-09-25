"""Validate the API design and fixtures; does not exercise an API server."""

from copy import deepcopy
from pathlib import Path
import re

import yaml
from jsonschema import Draft202012Validator
from openapi_spec_validator import validate


ROOT = Path(__file__).resolve().parents[1]
document = yaml.safe_load((ROOT / "specs/openapi.yaml").read_text())
validate(document)


def resolve(value):
    if isinstance(value, list):
        return [resolve(item) for item in value]
    if not isinstance(value, dict):
        return value
    if "$ref" in value:
        target = document
        for part in value["$ref"].removeprefix("#/").split("/"):
            target = target[part.replace("~1", "/").replace("~0", "~")]
        return resolve(target) | resolve({k: v for k, v in value.items() if k != "$ref"})
    return {key: resolve(item) for key, item in value.items()}


examples = {key: item["value"] for key, item in document["components"]["examples"].items()}
schemas = document["components"]["schemas"]
sample = document["x-mock-sample"]
scenario_names = set(document["components"]["parameters"]["MockScenario"]["schema"]["enum"])
example_count = scenario_count = 0
operations = {}
for path, methods in document["paths"].items():
    for method, operation in methods.items():
        operations[operation["operationId"]] = (method, path)
        for response in operation["responses"].values():
            cache_pattern = response["headers"]["Cache-Control"]["schema"]["pattern"]
            assert re.search(cache_pattern, "no-store")
            assert re.search(cache_pattern, "private, no-cache, no-store, max-age=0, must-revalidate")
            assert not re.search(cache_pattern, "public, max-age=3600")
            media = response["content"]["application/json"]
            validator = Draft202012Validator(resolve(media["schema"]))
            for example in media["examples"].values():
                value = resolve(example)["value"]
                validator.validate(value)
                assert value["meta"]["mode"] == "mock"
                example_count += 1
        for scenario, outcome in operation["x-mock-scenarios"].items():
            assert scenario in scenario_names
            media = operation["responses"][str(outcome["status"])]["content"]["application/json"]
            assert outcome["example"] in media["examples"]
            Draft202012Validator(resolve(media["schema"])).validate(examples[outcome["example"]])
            scenario_count += 1
        if "requestBody" in operation:
            media = operation["requestBody"]["content"]["application/json"]
            Draft202012Validator(resolve(media["schema"])).validate(media["example"])
            assert media["example"] == {key: sample[key] for key in ("walletAddress", "chainId", "nickname")}

assert operations == {
    "getCard": ("get", "/api/v1/cards/{cardId}"),
    "prepareRegistration": ("post", "/api/v1/cards/{cardId}/registration/prepare"),
    "getRegistrationTransaction": ("get", "/api/v1/cards/{cardId}/transactions/{txHash}"),
}
owner = {"address": sample["walletAddress"], "nickname": sample["nickname"]}
for name in ("registered", "evidence-pending", "confirmed"):
    assert examples[name]["data"]["owner"] == owner
for name in ("registered", "unregistered", "evidence-pending"):
    card = examples[name]["data"]
    assert card["registry"] == {key: sample[key] for key in ("chainId", "contractAddress", "issuer")}
    assert card["playerName"] == sample["playerName"]
for value in examples.values():
    if "data" in value:
        assert value["data"]["cardId"] == sample["cardId"]
        if "transactionHash" in value["data"]:
            assert value["data"]["transactionHash"] == sample["transactionHash"]
assert examples["registered"]["data"]["evidence"] == {
    "status": "available", "transactionHash": sample["transactionHash"], "blockNumber": sample["blockNumber"]
}
assert examples["confirmed"]["data"]["blockNumber"] == sample["blockNumber"]
assert examples["prepared"]["data"] == {
    "cardId": sample["cardId"], "nickname": sample["nickname"],
    "transaction": {"chainId": 80002, "from": sample["walletAddress"],
                    "to": sample["contractAddress"], "data": "0x", "value": "0"},
}

invalid_cases = []
for name, field, replacement in (
    ("registered", "owner", None),
    ("unregistered", "owner", owner),
    ("registered", "evidence", {"status": "available", "blockNumber": 100}),
):
    value = deepcopy(examples[name])
    value["data"][field] = replacement
    invalid_cases.append(("CardResponse", value))
for name, field in (("confirmed", "owner"), ("unknown", "reason")):
    value = deepcopy(examples[name])
    del value["data"][field]
    invalid_cases.append(("TransactionResponse", value))
request = {key: sample[key] for key in ("walletAddress", "chainId", "nickname")}
for field, replacement in (("extra", True), ("chainId", "80002"), ("nickname", ""), ("walletAddress", "0x123")):
    invalid_cases.append(("PrepareRequest", request | {field: replacement}))
invalid_cases.append(("TransactionHash", "0x123"))
for schema, value in invalid_cases:
    assert not Draft202012Validator(resolve(schemas[schema])).is_valid(value), (schema, value)

print(f"OpenAPI valid: {len(operations)} operations, {example_count} response examples, "
      f"{scenario_count} scenarios, {len(invalid_cases)} invalid payloads rejected; fixtures consistent.")
