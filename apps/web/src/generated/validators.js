// Generated from specs/openapi.yaml. Run npm run generate.
import ucs2lengthModule from "ajv/dist/runtime/ucs2length.js";
"use strict";
export const Address = validate20;
const schema31 = {"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"};
const pattern4 = new RegExp("^0x[0-9a-fA-F]{40}$", "u");

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(typeof data === "string"){
if(!pattern4.test(data)){
validate20.errors = [{instancePath,schemaPath:"#/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate20.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"dynamicProps":false,"dynamicItems":false};

export const TransactionHash = validate21;
const schema32 = {"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"};
const pattern5 = new RegExp("^0x[0-9a-fA-F]{64}$", "u");

function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate21.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(typeof data === "string"){
if(!pattern5.test(data)){
validate21.errors = [{instancePath,schemaPath:"#/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""}];
return false;
}
}
else {
validate21.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
validate21.errors = vErrors;
return errors === 0;
}
validate21.evaluated = {"dynamicProps":false,"dynamicItems":false};

export const CardId = validate22;
const schema33 = {"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"};
const func1 = ucs2lengthModule.default;
const pattern6 = new RegExp("^[A-Za-z0-9_-]+$", "u");

function validate22(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate22.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(typeof data === "string"){
if(func1(data) > 64){
validate22.errors = [{instancePath,schemaPath:"#/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data) < 1){
validate22.errors = [{instancePath,schemaPath:"#/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data)){
validate22.errors = [{instancePath,schemaPath:"#/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate22.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
validate22.errors = vErrors;
return errors === 0;
}
validate22.evaluated = {"dynamicProps":false,"dynamicItems":false};

export const Meta = validate23;
const schema34 = {"type":"object","additionalProperties":false,"required":["mode"],"properties":{"mode":{"type":"string","enum":["mock","live"]}},"description":"mockは模擬操作、liveは設定したチェーンの実記録。mockの取引は実送信不可。"};

function validate23(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate23.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.mode === undefined) && (missing0 = "mode")){
validate23.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(key0 === "mode")){
validate23.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.mode !== undefined){
let data0 = data.mode;
if(typeof data0 !== "string"){
validate23.errors = [{instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data0 === "mock") || (data0 === "live"))){
validate23.errors = [{instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/enum",keyword:"enum",params:{allowedValues: schema34.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate23.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate23.errors = vErrors;
return errors === 0;
}
validate23.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Owner = validate24;
const schema35 = {"type":"object","additionalProperties":false,"required":["address","nickname"],"properties":{"address":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"nickname":{"type":"string","minLength":1}}};

function validate24(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate24.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.address === undefined) && (missing0 = "address")) || ((data.nickname === undefined) && (missing0 = "nickname"))){
validate24.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "address") || (key0 === "nickname"))){
validate24.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.address !== undefined){
let data0 = data.address;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
validate24.errors = [{instancePath:instancePath+"/address",schemaPath:"#/properties/address/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate24.errors = [{instancePath:instancePath+"/address",schemaPath:"#/properties/address/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nickname !== undefined){
let data1 = data.nickname;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(func1(data1) < 1){
validate24.errors = [{instancePath:instancePath+"/nickname",schemaPath:"#/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
else {
validate24.errors = [{instancePath:instancePath+"/nickname",schemaPath:"#/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate24.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate24.errors = vErrors;
return errors === 0;
}
validate24.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const Registry = validate25;
const schema36 = {"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}};

function validate25(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate25.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.chainId === undefined) && (missing0 = "chainId")) || ((data.contractAddress === undefined) && (missing0 = "contractAddress"))) || ((data.issuer === undefined) && (missing0 = "issuer"))){
validate25.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "chainId") || (key0 === "contractAddress")) || (key0 === "issuer"))){
validate25.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.chainId !== undefined){
let data0 = data.chainId;
const _errs2 = errors;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
validate25.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs2){
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
validate25.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data0 < 1 || isNaN(data0)){
validate25.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.contractAddress !== undefined){
let data1 = data.contractAddress;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
validate25.errors = [{instancePath:instancePath+"/contractAddress",schemaPath:"#/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate25.errors = [{instancePath:instancePath+"/contractAddress",schemaPath:"#/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.issuer !== undefined){
let data2 = data.issuer;
const _errs6 = errors;
if(errors === _errs6){
if(typeof data2 === "string"){
if(!pattern4.test(data2)){
validate25.errors = [{instancePath:instancePath+"/issuer",schemaPath:"#/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate25.errors = [{instancePath:instancePath+"/issuer",schemaPath:"#/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate25.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate25.errors = vErrors;
return errors === 0;
}
validate25.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const EvidenceAvailable = validate26;
const schema37 = {"type":"object","additionalProperties":false,"required":["status","transactionHash","blockNumber"],"properties":{"status":{"type":"string","enum":["available"]},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"blockNumber":{"type":"integer","minimum":0}}};

function validate26(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate26.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.status === undefined) && (missing0 = "status")) || ((data.transactionHash === undefined) && (missing0 = "transactionHash"))) || ((data.blockNumber === undefined) && (missing0 = "blockNumber"))){
validate26.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "status") || (key0 === "transactionHash")) || (key0 === "blockNumber"))){
validate26.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
const _errs2 = errors;
if(typeof data0 !== "string"){
validate26.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data0 === "available")){
validate26.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema37.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.transactionHash !== undefined){
let data1 = data.transactionHash;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern5.test(data1)){
validate26.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""}];
return false;
}
}
else {
validate26.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.blockNumber !== undefined){
let data2 = data.blockNumber;
const _errs6 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
validate26.errors = [{instancePath:instancePath+"/blockNumber",schemaPath:"#/properties/blockNumber/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs6){
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 < 0 || isNaN(data2)){
validate26.errors = [{instancePath:instancePath+"/blockNumber",schemaPath:"#/properties/blockNumber/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"}];
return false;
}
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate26.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate26.errors = vErrors;
return errors === 0;
}
validate26.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const EvidencePending = validate27;
const schema38 = {"type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"type":"string","enum":["pending"]}}};

function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.status === undefined) && (missing0 = "status")){
validate27.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(key0 === "status")){
validate27.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
if(typeof data0 !== "string"){
validate27.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data0 === "pending")){
validate27.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema38.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate27.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate27.errors = vErrors;
return errors === 0;
}
validate27.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const EvidenceNone = validate28;
const schema39 = {"type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"type":"string","enum":["none"]}}};

function validate28(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate28.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.status === undefined) && (missing0 = "status")){
validate28.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(key0 === "status")){
validate28.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.status !== undefined){
let data0 = data.status;
if(typeof data0 !== "string"){
validate28.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data0 === "none")){
validate28.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema39.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate28.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate28.errors = vErrors;
return errors === 0;
}
validate28.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const UnregisteredCard = validate29;
const schema40 = {"type":"object","additionalProperties":false,"required":["cardId","registry","playerName","status","owner","evidence"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"registry":{"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}},"playerName":{"type":"string"},"status":{"type":"string","enum":["unregistered"]},"owner":{"type":"null"},"evidence":{"type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"type":"string","enum":["none"]}}}}};

function validate29(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate29.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.registry === undefined) && (missing0 = "registry"))) || ((data.playerName === undefined) && (missing0 = "playerName"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.owner === undefined) && (missing0 = "owner"))) || ((data.evidence === undefined) && (missing0 = "evidence"))){
validate29.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "cardId") || (key0 === "registry")) || (key0 === "playerName")) || (key0 === "status")) || (key0 === "owner")) || (key0 === "evidence"))){
validate29.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate29.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate29.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate29.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate29.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.registry !== undefined){
let data1 = data.registry;
const _errs4 = errors;
if(errors === _errs4){
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
let missing1;
if((((data1.chainId === undefined) && (missing1 = "chainId")) || ((data1.contractAddress === undefined) && (missing1 = "contractAddress"))) || ((data1.issuer === undefined) && (missing1 = "issuer"))){
validate29.errors = [{instancePath:instancePath+"/registry",schemaPath:"#/properties/registry/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs6 = errors;
for(const key1 in data1){
if(!(((key1 === "chainId") || (key1 === "contractAddress")) || (key1 === "issuer"))){
validate29.errors = [{instancePath:instancePath+"/registry",schemaPath:"#/properties/registry/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs6 === errors){
if(data1.chainId !== undefined){
let data2 = data1.chainId;
const _errs7 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
validate29.errors = [{instancePath:instancePath+"/registry/chainId",schemaPath:"#/properties/registry/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs7){
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 9007199254740991 || isNaN(data2)){
validate29.errors = [{instancePath:instancePath+"/registry/chainId",schemaPath:"#/properties/registry/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data2 < 1 || isNaN(data2)){
validate29.errors = [{instancePath:instancePath+"/registry/chainId",schemaPath:"#/properties/registry/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid1 = _errs7 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data1.contractAddress !== undefined){
let data3 = data1.contractAddress;
const _errs9 = errors;
if(errors === _errs9){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate29.errors = [{instancePath:instancePath+"/registry/contractAddress",schemaPath:"#/properties/registry/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate29.errors = [{instancePath:instancePath+"/registry/contractAddress",schemaPath:"#/properties/registry/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs9 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data1.issuer !== undefined){
let data4 = data1.issuer;
const _errs11 = errors;
if(errors === _errs11){
if(typeof data4 === "string"){
if(!pattern4.test(data4)){
validate29.errors = [{instancePath:instancePath+"/registry/issuer",schemaPath:"#/properties/registry/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate29.errors = [{instancePath:instancePath+"/registry/issuer",schemaPath:"#/properties/registry/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs11 === errors;
}
else {
var valid1 = true;
}
}
}
}
}
}
else {
validate29.errors = [{instancePath:instancePath+"/registry",schemaPath:"#/properties/registry/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.playerName !== undefined){
const _errs13 = errors;
if(typeof data.playerName !== "string"){
validate29.errors = [{instancePath:instancePath+"/playerName",schemaPath:"#/properties/playerName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data6 = data.status;
const _errs15 = errors;
if(typeof data6 !== "string"){
validate29.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data6 === "unregistered")){
validate29.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema40.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.owner !== undefined){
const _errs17 = errors;
if(data.owner !== null){
validate29.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/type",keyword:"type",params:{type: "null"},message:"must be null"}];
return false;
}
var valid0 = _errs17 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.evidence !== undefined){
let data8 = data.evidence;
const _errs19 = errors;
if(errors === _errs19){
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
let missing2;
if((data8.status === undefined) && (missing2 = "status")){
validate29.errors = [{instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"}];
return false;
}
else {
const _errs21 = errors;
for(const key2 in data8){
if(!(key2 === "status")){
validate29.errors = [{instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs21 === errors){
if(data8.status !== undefined){
let data9 = data8.status;
if(typeof data9 !== "string"){
validate29.errors = [{instancePath:instancePath+"/evidence/status",schemaPath:"#/properties/evidence/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data9 === "none")){
validate29.errors = [{instancePath:instancePath+"/evidence/status",schemaPath:"#/properties/evidence/properties/status/enum",keyword:"enum",params:{allowedValues: schema40.properties.evidence.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate29.errors = [{instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs19 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate29.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate29.errors = vErrors;
return errors === 0;
}
validate29.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RegisteredCard = validate30;
const schema41 = {"type":"object","additionalProperties":false,"required":["cardId","registry","playerName","status","owner","evidence"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"registry":{"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}},"playerName":{"type":"string"},"status":{"type":"string","enum":["registered"]},"owner":{"type":"object","additionalProperties":false,"required":["address","nickname"],"properties":{"address":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"nickname":{"type":"string","minLength":1}}},"evidence":{"oneOf":[{"type":"object","additionalProperties":false,"required":["status","transactionHash","blockNumber"],"properties":{"status":{"type":"string","enum":["available"]},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"blockNumber":{"type":"integer","minimum":0}}},{"type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"type":"string","enum":["pending"]}}}]}}};

function validate30(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate30.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.registry === undefined) && (missing0 = "registry"))) || ((data.playerName === undefined) && (missing0 = "playerName"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.owner === undefined) && (missing0 = "owner"))) || ((data.evidence === undefined) && (missing0 = "evidence"))){
validate30.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((((key0 === "cardId") || (key0 === "registry")) || (key0 === "playerName")) || (key0 === "status")) || (key0 === "owner")) || (key0 === "evidence"))){
validate30.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate30.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate30.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate30.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate30.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.registry !== undefined){
let data1 = data.registry;
const _errs4 = errors;
if(errors === _errs4){
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
let missing1;
if((((data1.chainId === undefined) && (missing1 = "chainId")) || ((data1.contractAddress === undefined) && (missing1 = "contractAddress"))) || ((data1.issuer === undefined) && (missing1 = "issuer"))){
validate30.errors = [{instancePath:instancePath+"/registry",schemaPath:"#/properties/registry/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs6 = errors;
for(const key1 in data1){
if(!(((key1 === "chainId") || (key1 === "contractAddress")) || (key1 === "issuer"))){
validate30.errors = [{instancePath:instancePath+"/registry",schemaPath:"#/properties/registry/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs6 === errors){
if(data1.chainId !== undefined){
let data2 = data1.chainId;
const _errs7 = errors;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
validate30.errors = [{instancePath:instancePath+"/registry/chainId",schemaPath:"#/properties/registry/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs7){
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 9007199254740991 || isNaN(data2)){
validate30.errors = [{instancePath:instancePath+"/registry/chainId",schemaPath:"#/properties/registry/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data2 < 1 || isNaN(data2)){
validate30.errors = [{instancePath:instancePath+"/registry/chainId",schemaPath:"#/properties/registry/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid1 = _errs7 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data1.contractAddress !== undefined){
let data3 = data1.contractAddress;
const _errs9 = errors;
if(errors === _errs9){
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
validate30.errors = [{instancePath:instancePath+"/registry/contractAddress",schemaPath:"#/properties/registry/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate30.errors = [{instancePath:instancePath+"/registry/contractAddress",schemaPath:"#/properties/registry/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs9 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data1.issuer !== undefined){
let data4 = data1.issuer;
const _errs11 = errors;
if(errors === _errs11){
if(typeof data4 === "string"){
if(!pattern4.test(data4)){
validate30.errors = [{instancePath:instancePath+"/registry/issuer",schemaPath:"#/properties/registry/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate30.errors = [{instancePath:instancePath+"/registry/issuer",schemaPath:"#/properties/registry/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs11 === errors;
}
else {
var valid1 = true;
}
}
}
}
}
}
else {
validate30.errors = [{instancePath:instancePath+"/registry",schemaPath:"#/properties/registry/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.playerName !== undefined){
const _errs13 = errors;
if(typeof data.playerName !== "string"){
validate30.errors = [{instancePath:instancePath+"/playerName",schemaPath:"#/properties/playerName/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
var valid0 = _errs13 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data6 = data.status;
const _errs15 = errors;
if(typeof data6 !== "string"){
validate30.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data6 === "registered")){
validate30.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema41.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.owner !== undefined){
let data7 = data.owner;
const _errs17 = errors;
if(errors === _errs17){
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
let missing2;
if(((data7.address === undefined) && (missing2 = "address")) || ((data7.nickname === undefined) && (missing2 = "nickname"))){
validate30.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"}];
return false;
}
else {
const _errs19 = errors;
for(const key2 in data7){
if(!((key2 === "address") || (key2 === "nickname"))){
validate30.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs19 === errors){
if(data7.address !== undefined){
let data8 = data7.address;
const _errs20 = errors;
if(errors === _errs20){
if(typeof data8 === "string"){
if(!pattern4.test(data8)){
validate30.errors = [{instancePath:instancePath+"/owner/address",schemaPath:"#/properties/owner/properties/address/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate30.errors = [{instancePath:instancePath+"/owner/address",schemaPath:"#/properties/owner/properties/address/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid2 = _errs20 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data7.nickname !== undefined){
let data9 = data7.nickname;
const _errs22 = errors;
if(errors === _errs22){
if(typeof data9 === "string"){
if(func1(data9) < 1){
validate30.errors = [{instancePath:instancePath+"/owner/nickname",schemaPath:"#/properties/owner/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
else {
validate30.errors = [{instancePath:instancePath+"/owner/nickname",schemaPath:"#/properties/owner/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid2 = _errs22 === errors;
}
else {
var valid2 = true;
}
}
}
}
}
else {
validate30.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs17 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.evidence !== undefined){
let data10 = data.evidence;
const _errs24 = errors;
const _errs25 = errors;
let valid3 = false;
let passing0 = null;
const _errs26 = errors;
if(errors === _errs26){
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
let missing3;
if((((data10.status === undefined) && (missing3 = "status")) || ((data10.transactionHash === undefined) && (missing3 = "transactionHash"))) || ((data10.blockNumber === undefined) && (missing3 = "blockNumber"))){
const err0 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf/0/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
const _errs28 = errors;
for(const key3 in data10){
if(!(((key3 === "status") || (key3 === "transactionHash")) || (key3 === "blockNumber"))){
const err1 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs28 === errors){
if(data10.status !== undefined){
let data11 = data10.status;
const _errs29 = errors;
if(typeof data11 !== "string"){
const err2 = {instancePath:instancePath+"/evidence/status",schemaPath:"#/properties/evidence/oneOf/0/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(!(data11 === "available")){
const err3 = {instancePath:instancePath+"/evidence/status",schemaPath:"#/properties/evidence/oneOf/0/properties/status/enum",keyword:"enum",params:{allowedValues: schema41.properties.evidence.oneOf[0].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var valid4 = _errs29 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data10.transactionHash !== undefined){
let data12 = data10.transactionHash;
const _errs31 = errors;
if(errors === _errs31){
if(typeof data12 === "string"){
if(!pattern5.test(data12)){
const err4 = {instancePath:instancePath+"/evidence/transactionHash",schemaPath:"#/properties/evidence/oneOf/0/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/evidence/transactionHash",schemaPath:"#/properties/evidence/oneOf/0/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var valid4 = _errs31 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data10.blockNumber !== undefined){
let data13 = data10.blockNumber;
const _errs33 = errors;
if(!(((typeof data13 == "number") && (!(data13 % 1) && !isNaN(data13))) && (isFinite(data13)))){
const err6 = {instancePath:instancePath+"/evidence/blockNumber",schemaPath:"#/properties/evidence/oneOf/0/properties/blockNumber/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(errors === _errs33){
if((typeof data13 == "number") && (isFinite(data13))){
if(data13 < 0 || isNaN(data13)){
const err7 = {instancePath:instancePath+"/evidence/blockNumber",schemaPath:"#/properties/evidence/oneOf/0/properties/blockNumber/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
}
var valid4 = _errs33 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
}
else {
const err8 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
var _valid0 = _errs26 === errors;
if(_valid0){
valid3 = true;
passing0 = 0;
var props0 = true;
}
const _errs35 = errors;
if(errors === _errs35){
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
let missing4;
if((data10.status === undefined) && (missing4 = "status")){
const err9 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf/1/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
else {
const _errs37 = errors;
for(const key4 in data10){
if(!(key4 === "status")){
const err10 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
break;
}
}
if(_errs37 === errors){
if(data10.status !== undefined){
let data14 = data10.status;
if(typeof data14 !== "string"){
const err11 = {instancePath:instancePath+"/evidence/status",schemaPath:"#/properties/evidence/oneOf/1/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!(data14 === "pending")){
const err12 = {instancePath:instancePath+"/evidence/status",schemaPath:"#/properties/evidence/oneOf/1/properties/status/enum",keyword:"enum",params:{allowedValues: schema41.properties.evidence.oneOf[1].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
}
}
else {
const err13 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
var _valid0 = _errs35 === errors;
if(_valid0 && valid3){
valid3 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid3 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid3){
const err14 = {instancePath:instancePath+"/evidence",schemaPath:"#/properties/evidence/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
validate30.errors = vErrors;
return false;
}
else {
errors = _errs25;
if(vErrors !== null){
if(_errs25){
vErrors.length = _errs25;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs24 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
}
else {
validate30.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate30.errors = vErrors;
return errors === 0;
}
validate30.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const PrepareRequest = validate31;
const schema42 = {"type":"object","additionalProperties":false,"required":["walletAddress","chainId","nickname"],"properties":{"walletAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"nickname":{"type":"string","minLength":1,"description":"liveでは1〜96 UTF-8バイト、不正Unicodeを拒否する。trim・正規化なし。mockは固定サンプルだけ受理。"}}};

function validate31(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate31.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.walletAddress === undefined) && (missing0 = "walletAddress")) || ((data.chainId === undefined) && (missing0 = "chainId"))) || ((data.nickname === undefined) && (missing0 = "nickname"))){
validate31.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "walletAddress") || (key0 === "chainId")) || (key0 === "nickname"))){
validate31.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.walletAddress !== undefined){
let data0 = data.walletAddress;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
validate31.errors = [{instancePath:instancePath+"/walletAddress",schemaPath:"#/properties/walletAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate31.errors = [{instancePath:instancePath+"/walletAddress",schemaPath:"#/properties/walletAddress/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.chainId !== undefined){
let data1 = data.chainId;
const _errs4 = errors;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
validate31.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs4){
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 > 9007199254740991 || isNaN(data1)){
validate31.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data1 < 1 || isNaN(data1)){
validate31.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nickname !== undefined){
let data2 = data.nickname;
const _errs6 = errors;
if(errors === _errs6){
if(typeof data2 === "string"){
if(func1(data2) < 1){
validate31.errors = [{instancePath:instancePath+"/nickname",schemaPath:"#/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
else {
validate31.errors = [{instancePath:instancePath+"/nickname",schemaPath:"#/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate31.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate31.errors = vErrors;
return errors === 0;
}
validate31.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const UnsignedTransaction = validate32;
const schema43 = {"type":"object","additionalProperties":false,"required":["chainId","from","to","data","value"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"from":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"to":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"data":{"type":"string","pattern":"^0x(?:[0-9a-fA-F]{2})*$"},"value":{"type":"string","const":"0"}},"description":"共通転送形式。valueはweiの10進文字列。この操作は送金しない。モックのdata=0xはABI未確定のプレースホルダーで、実送信不可。nonce・gas・手数料は含めない。"};
const pattern22 = new RegExp("^0x(?:[0-9a-fA-F]{2})*$", "u");

function validate32(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate32.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.chainId === undefined) && (missing0 = "chainId")) || ((data.from === undefined) && (missing0 = "from"))) || ((data.to === undefined) && (missing0 = "to"))) || ((data.data === undefined) && (missing0 = "data"))) || ((data.value === undefined) && (missing0 = "value"))){
validate32.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "chainId") || (key0 === "from")) || (key0 === "to")) || (key0 === "data")) || (key0 === "value"))){
validate32.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.chainId !== undefined){
let data0 = data.chainId;
const _errs2 = errors;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
validate32.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs2){
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 9007199254740991 || isNaN(data0)){
validate32.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data0 < 1 || isNaN(data0)){
validate32.errors = [{instancePath:instancePath+"/chainId",schemaPath:"#/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.from !== undefined){
let data1 = data.from;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
validate32.errors = [{instancePath:instancePath+"/from",schemaPath:"#/properties/from/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate32.errors = [{instancePath:instancePath+"/from",schemaPath:"#/properties/from/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.to !== undefined){
let data2 = data.to;
const _errs6 = errors;
if(errors === _errs6){
if(typeof data2 === "string"){
if(!pattern4.test(data2)){
validate32.errors = [{instancePath:instancePath+"/to",schemaPath:"#/properties/to/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate32.errors = [{instancePath:instancePath+"/to",schemaPath:"#/properties/to/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.data !== undefined){
let data3 = data.data;
const _errs8 = errors;
if(errors === _errs8){
if(typeof data3 === "string"){
if(!pattern22.test(data3)){
validate32.errors = [{instancePath:instancePath+"/data",schemaPath:"#/properties/data/pattern",keyword:"pattern",params:{pattern: "^0x(?:[0-9a-fA-F]{2})*$"},message:"must match pattern \""+"^0x(?:[0-9a-fA-F]{2})*$"+"\""}];
return false;
}
}
else {
validate32.errors = [{instancePath:instancePath+"/data",schemaPath:"#/properties/data/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.value !== undefined){
let data4 = data.value;
const _errs10 = errors;
if(typeof data4 !== "string"){
validate32.errors = [{instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("0" !== data4){
validate32.errors = [{instancePath:instancePath+"/value",schemaPath:"#/properties/value/const",keyword:"const",params:{allowedValue: "0"},message:"must be equal to constant"}];
return false;
}
var valid0 = _errs10 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate32.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate32.errors = vErrors;
return errors === 0;
}
validate32.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const PreparedRegistration = validate33;
const schema44 = {"type":"object","additionalProperties":false,"required":["cardId","nickname","transaction"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"nickname":{"type":"string","minLength":1},"transaction":{"type":"object","additionalProperties":false,"required":["chainId","from","to","data","value"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"from":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"to":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"data":{"type":"string","pattern":"^0x(?:[0-9a-fA-F]{2})*$"},"value":{"type":"string","const":"0"}},"description":"共通転送形式。valueはweiの10進文字列。この操作は送金しない。モックのdata=0xはABI未確定のプレースホルダーで、実送信不可。nonce・gas・手数料は含めない。"}}};

function validate33(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate33.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.nickname === undefined) && (missing0 = "nickname"))) || ((data.transaction === undefined) && (missing0 = "transaction"))){
validate33.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "cardId") || (key0 === "nickname")) || (key0 === "transaction"))){
validate33.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate33.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate33.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate33.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate33.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.nickname !== undefined){
let data1 = data.nickname;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(func1(data1) < 1){
validate33.errors = [{instancePath:instancePath+"/nickname",schemaPath:"#/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
else {
validate33.errors = [{instancePath:instancePath+"/nickname",schemaPath:"#/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.transaction !== undefined){
let data2 = data.transaction;
const _errs6 = errors;
if(errors === _errs6){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing1;
if((((((data2.chainId === undefined) && (missing1 = "chainId")) || ((data2.from === undefined) && (missing1 = "from"))) || ((data2.to === undefined) && (missing1 = "to"))) || ((data2.data === undefined) && (missing1 = "data"))) || ((data2.value === undefined) && (missing1 = "value"))){
validate33.errors = [{instancePath:instancePath+"/transaction",schemaPath:"#/properties/transaction/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs8 = errors;
for(const key1 in data2){
if(!(((((key1 === "chainId") || (key1 === "from")) || (key1 === "to")) || (key1 === "data")) || (key1 === "value"))){
validate33.errors = [{instancePath:instancePath+"/transaction",schemaPath:"#/properties/transaction/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs8 === errors){
if(data2.chainId !== undefined){
let data3 = data2.chainId;
const _errs9 = errors;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
validate33.errors = [{instancePath:instancePath+"/transaction/chainId",schemaPath:"#/properties/transaction/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs9){
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 9007199254740991 || isNaN(data3)){
validate33.errors = [{instancePath:instancePath+"/transaction/chainId",schemaPath:"#/properties/transaction/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data3 < 1 || isNaN(data3)){
validate33.errors = [{instancePath:instancePath+"/transaction/chainId",schemaPath:"#/properties/transaction/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid1 = _errs9 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.from !== undefined){
let data4 = data2.from;
const _errs11 = errors;
if(errors === _errs11){
if(typeof data4 === "string"){
if(!pattern4.test(data4)){
validate33.errors = [{instancePath:instancePath+"/transaction/from",schemaPath:"#/properties/transaction/properties/from/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate33.errors = [{instancePath:instancePath+"/transaction/from",schemaPath:"#/properties/transaction/properties/from/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs11 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.to !== undefined){
let data5 = data2.to;
const _errs13 = errors;
if(errors === _errs13){
if(typeof data5 === "string"){
if(!pattern4.test(data5)){
validate33.errors = [{instancePath:instancePath+"/transaction/to",schemaPath:"#/properties/transaction/properties/to/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate33.errors = [{instancePath:instancePath+"/transaction/to",schemaPath:"#/properties/transaction/properties/to/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs13 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.data !== undefined){
let data6 = data2.data;
const _errs15 = errors;
if(errors === _errs15){
if(typeof data6 === "string"){
if(!pattern22.test(data6)){
validate33.errors = [{instancePath:instancePath+"/transaction/data",schemaPath:"#/properties/transaction/properties/data/pattern",keyword:"pattern",params:{pattern: "^0x(?:[0-9a-fA-F]{2})*$"},message:"must match pattern \""+"^0x(?:[0-9a-fA-F]{2})*$"+"\""}];
return false;
}
}
else {
validate33.errors = [{instancePath:instancePath+"/transaction/data",schemaPath:"#/properties/transaction/properties/data/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs15 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.value !== undefined){
let data7 = data2.value;
const _errs17 = errors;
if(typeof data7 !== "string"){
validate33.errors = [{instancePath:instancePath+"/transaction/value",schemaPath:"#/properties/transaction/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("0" !== data7){
validate33.errors = [{instancePath:instancePath+"/transaction/value",schemaPath:"#/properties/transaction/properties/value/const",keyword:"const",params:{allowedValue: "0"},message:"must be equal to constant"}];
return false;
}
var valid1 = _errs17 === errors;
}
else {
var valid1 = true;
}
}
}
}
}
}
}
}
else {
validate33.errors = [{instancePath:instancePath+"/transaction",schemaPath:"#/properties/transaction/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate33.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate33.errors = vErrors;
return errors === 0;
}
validate33.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const PendingTransaction = validate34;
const schema45 = {"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["pending"]}}};

function validate34(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate34.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.transactionHash === undefined) && (missing0 = "transactionHash"))) || ((data.status === undefined) && (missing0 = "status"))){
validate34.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "cardId") || (key0 === "transactionHash")) || (key0 === "status"))){
validate34.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate34.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate34.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate34.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate34.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.transactionHash !== undefined){
let data1 = data.transactionHash;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern5.test(data1)){
validate34.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""}];
return false;
}
}
else {
validate34.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data2 = data.status;
const _errs6 = errors;
if(typeof data2 !== "string"){
validate34.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data2 === "pending")){
validate34.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema45.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate34.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate34.errors = vErrors;
return errors === 0;
}
validate34.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const ConfirmedTransaction = validate35;
const schema46 = {"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status","owner","blockNumber"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["confirmed"]},"owner":{"type":"object","additionalProperties":false,"required":["address","nickname"],"properties":{"address":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"nickname":{"type":"string","minLength":1}}},"blockNumber":{"type":"integer","minimum":0}}};

function validate35(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate35.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.transactionHash === undefined) && (missing0 = "transactionHash"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.owner === undefined) && (missing0 = "owner"))) || ((data.blockNumber === undefined) && (missing0 = "blockNumber"))){
validate35.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((((key0 === "cardId") || (key0 === "transactionHash")) || (key0 === "status")) || (key0 === "owner")) || (key0 === "blockNumber"))){
validate35.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate35.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate35.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate35.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate35.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.transactionHash !== undefined){
let data1 = data.transactionHash;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern5.test(data1)){
validate35.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""}];
return false;
}
}
else {
validate35.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data2 = data.status;
const _errs6 = errors;
if(typeof data2 !== "string"){
validate35.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data2 === "confirmed")){
validate35.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema46.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.owner !== undefined){
let data3 = data.owner;
const _errs8 = errors;
if(errors === _errs8){
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
let missing1;
if(((data3.address === undefined) && (missing1 = "address")) || ((data3.nickname === undefined) && (missing1 = "nickname"))){
validate35.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs10 = errors;
for(const key1 in data3){
if(!((key1 === "address") || (key1 === "nickname"))){
validate35.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs10 === errors){
if(data3.address !== undefined){
let data4 = data3.address;
const _errs11 = errors;
if(errors === _errs11){
if(typeof data4 === "string"){
if(!pattern4.test(data4)){
validate35.errors = [{instancePath:instancePath+"/owner/address",schemaPath:"#/properties/owner/properties/address/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate35.errors = [{instancePath:instancePath+"/owner/address",schemaPath:"#/properties/owner/properties/address/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs11 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data3.nickname !== undefined){
let data5 = data3.nickname;
const _errs13 = errors;
if(errors === _errs13){
if(typeof data5 === "string"){
if(func1(data5) < 1){
validate35.errors = [{instancePath:instancePath+"/owner/nickname",schemaPath:"#/properties/owner/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
else {
validate35.errors = [{instancePath:instancePath+"/owner/nickname",schemaPath:"#/properties/owner/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid1 = _errs13 === errors;
}
else {
var valid1 = true;
}
}
}
}
}
else {
validate35.errors = [{instancePath:instancePath+"/owner",schemaPath:"#/properties/owner/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.blockNumber !== undefined){
let data6 = data.blockNumber;
const _errs15 = errors;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
validate35.errors = [{instancePath:instancePath+"/blockNumber",schemaPath:"#/properties/blockNumber/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs15){
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 < 0 || isNaN(data6)){
validate35.errors = [{instancePath:instancePath+"/blockNumber",schemaPath:"#/properties/blockNumber/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"}];
return false;
}
}
}
var valid0 = _errs15 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
}
else {
validate35.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate35.errors = vErrors;
return errors === 0;
}
validate35.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const RevertedTransaction = validate36;
const schema47 = {"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["reverted"]}}};

function validate36(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate36.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.transactionHash === undefined) && (missing0 = "transactionHash"))) || ((data.status === undefined) && (missing0 = "status"))){
validate36.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!(((key0 === "cardId") || (key0 === "transactionHash")) || (key0 === "status"))){
validate36.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate36.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate36.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate36.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate36.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.transactionHash !== undefined){
let data1 = data.transactionHash;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern5.test(data1)){
validate36.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""}];
return false;
}
}
else {
validate36.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data2 = data.status;
const _errs6 = errors;
if(typeof data2 !== "string"){
validate36.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data2 === "reverted")){
validate36.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema47.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate36.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate36.errors = vErrors;
return errors === 0;
}
validate36.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const UnknownTransaction = validate37;
const schema48 = {"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status","reason"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["unknown"]},"reason":{"type":"string","enum":["TRANSACTION_NOT_SEEN","RECORD_MISMATCH"]}}};

function validate37(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate37.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((((data.cardId === undefined) && (missing0 = "cardId")) || ((data.transactionHash === undefined) && (missing0 = "transactionHash"))) || ((data.status === undefined) && (missing0 = "status"))) || ((data.reason === undefined) && (missing0 = "reason"))){
validate37.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((((key0 === "cardId") || (key0 === "transactionHash")) || (key0 === "status")) || (key0 === "reason"))){
validate37.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.cardId !== undefined){
let data0 = data.cardId;
const _errs2 = errors;
if(errors === _errs2){
if(typeof data0 === "string"){
if(func1(data0) > 64){
validate37.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data0) < 1){
validate37.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data0)){
validate37.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate37.errors = [{instancePath:instancePath+"/cardId",schemaPath:"#/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.transactionHash !== undefined){
let data1 = data.transactionHash;
const _errs4 = errors;
if(errors === _errs4){
if(typeof data1 === "string"){
if(!pattern5.test(data1)){
validate37.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""}];
return false;
}
}
else {
validate37.errors = [{instancePath:instancePath+"/transactionHash",schemaPath:"#/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.status !== undefined){
let data2 = data.status;
const _errs6 = errors;
if(typeof data2 !== "string"){
validate37.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!(data2 === "unknown")){
validate37.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema48.properties.status.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs6 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.reason !== undefined){
let data3 = data.reason;
const _errs8 = errors;
if(typeof data3 !== "string"){
validate37.errors = [{instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data3 === "TRANSACTION_NOT_SEEN") || (data3 === "RECORD_MISMATCH"))){
validate37.errors = [{instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/enum",keyword:"enum",params:{allowedValues: schema48.properties.reason.enum},message:"must be equal to one of the allowed values"}];
return false;
}
var valid0 = _errs8 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
}
else {
validate37.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate37.errors = vErrors;
return errors === 0;
}
validate37.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const CardResponse = validate38;
const schema49 = {"type":"object","additionalProperties":false,"required":["meta","data"],"properties":{"meta":{"type":"object","additionalProperties":false,"required":["mode"],"properties":{"mode":{"type":"string","enum":["mock","live"]}},"description":"mockは模擬操作、liveは設定したチェーンの実記録。mockの取引は実送信不可。"},"data":{"oneOf":[{"type":"object","additionalProperties":false,"required":["cardId","registry","playerName","status","owner","evidence"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"registry":{"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}},"playerName":{"type":"string"},"status":{"type":"string","enum":["unregistered"]},"owner":{"type":"null"},"evidence":{"type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"type":"string","enum":["none"]}}}}},{"type":"object","additionalProperties":false,"required":["cardId","registry","playerName","status","owner","evidence"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"registry":{"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}},"playerName":{"type":"string"},"status":{"type":"string","enum":["registered"]},"owner":{"type":"object","additionalProperties":false,"required":["address","nickname"],"properties":{"address":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"nickname":{"type":"string","minLength":1}}},"evidence":{"oneOf":[{"type":"object","additionalProperties":false,"required":["status","transactionHash","blockNumber"],"properties":{"status":{"type":"string","enum":["available"]},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"blockNumber":{"type":"integer","minimum":0}}},{"type":"object","additionalProperties":false,"required":["status"],"properties":{"status":{"type":"string","enum":["pending"]}}}]}}}]}}};

function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.meta === undefined) && (missing0 = "meta")) || ((data.data === undefined) && (missing0 = "data"))){
validate38.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "meta") || (key0 === "data"))){
validate38.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.meta !== undefined){
let data0 = data.meta;
const _errs2 = errors;
if(errors === _errs2){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((data0.mode === undefined) && (missing1 = "mode")){
validate38.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs4 = errors;
for(const key1 in data0){
if(!(key1 === "mode")){
validate38.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs4 === errors){
if(data0.mode !== undefined){
let data1 = data0.mode;
if(typeof data1 !== "string"){
validate38.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data1 === "mock") || (data1 === "live"))){
validate38.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/enum",keyword:"enum",params:{allowedValues: schema49.properties.meta.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate38.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.data !== undefined){
let data2 = data.data;
const _errs7 = errors;
const _errs8 = errors;
let valid2 = false;
let passing0 = null;
const _errs9 = errors;
if(errors === _errs9){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing2;
if(((((((data2.cardId === undefined) && (missing2 = "cardId")) || ((data2.registry === undefined) && (missing2 = "registry"))) || ((data2.playerName === undefined) && (missing2 = "playerName"))) || ((data2.status === undefined) && (missing2 = "status"))) || ((data2.owner === undefined) && (missing2 = "owner"))) || ((data2.evidence === undefined) && (missing2 = "evidence"))){
const err0 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
const _errs11 = errors;
for(const key2 in data2){
if(!((((((key2 === "cardId") || (key2 === "registry")) || (key2 === "playerName")) || (key2 === "status")) || (key2 === "owner")) || (key2 === "evidence"))){
const err1 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs11 === errors){
if(data2.cardId !== undefined){
let data3 = data2.cardId;
const _errs12 = errors;
if(errors === _errs12){
if(typeof data3 === "string"){
if(func1(data3) > 64){
const err2 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
else {
if(func1(data3) < 1){
const err3 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
else {
if(!pattern6.test(data3)){
const err4 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
}
else {
const err5 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var valid3 = _errs12 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.registry !== undefined){
let data4 = data2.registry;
const _errs14 = errors;
if(errors === _errs14){
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
let missing3;
if((((data4.chainId === undefined) && (missing3 = "chainId")) || ((data4.contractAddress === undefined) && (missing3 = "contractAddress"))) || ((data4.issuer === undefined) && (missing3 = "issuer"))){
const err6 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/0/properties/registry/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
else {
const _errs16 = errors;
for(const key3 in data4){
if(!(((key3 === "chainId") || (key3 === "contractAddress")) || (key3 === "issuer"))){
const err7 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/0/properties/registry/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
break;
}
}
if(_errs16 === errors){
if(data4.chainId !== undefined){
let data5 = data4.chainId;
const _errs17 = errors;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err8 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(errors === _errs17){
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 9007199254740991 || isNaN(data5)){
const err9 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
else {
if(data5 < 1 || isNaN(data5)){
const err10 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
}
var valid4 = _errs17 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data4.contractAddress !== undefined){
let data6 = data4.contractAddress;
const _errs19 = errors;
if(errors === _errs19){
if(typeof data6 === "string"){
if(!pattern4.test(data6)){
const err11 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
var valid4 = _errs19 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data4.issuer !== undefined){
let data7 = data4.issuer;
const _errs21 = errors;
if(errors === _errs21){
if(typeof data7 === "string"){
if(!pattern4.test(data7)){
const err13 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
var valid4 = _errs21 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
}
else {
const err15 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/0/properties/registry/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.playerName !== undefined){
const _errs23 = errors;
if(typeof data2.playerName !== "string"){
const err16 = {instancePath:instancePath+"/data/playerName",schemaPath:"#/properties/data/oneOf/0/properties/playerName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var valid3 = _errs23 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.status !== undefined){
let data9 = data2.status;
const _errs25 = errors;
if(typeof data9 !== "string"){
const err17 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/0/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(!(data9 === "unregistered")){
const err18 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/0/properties/status/enum",keyword:"enum",params:{allowedValues: schema49.properties.data.oneOf[0].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
var valid3 = _errs25 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.owner !== undefined){
const _errs27 = errors;
if(data2.owner !== null){
const err19 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/0/properties/owner/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var valid3 = _errs27 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.evidence !== undefined){
let data11 = data2.evidence;
const _errs29 = errors;
if(errors === _errs29){
if(data11 && typeof data11 == "object" && !Array.isArray(data11)){
let missing4;
if((data11.status === undefined) && (missing4 = "status")){
const err20 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/0/properties/evidence/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
else {
const _errs31 = errors;
for(const key4 in data11){
if(!(key4 === "status")){
const err21 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/0/properties/evidence/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
break;
}
}
if(_errs31 === errors){
if(data11.status !== undefined){
let data12 = data11.status;
if(typeof data12 !== "string"){
const err22 = {instancePath:instancePath+"/data/evidence/status",schemaPath:"#/properties/data/oneOf/0/properties/evidence/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(!(data12 === "none")){
const err23 = {instancePath:instancePath+"/data/evidence/status",schemaPath:"#/properties/data/oneOf/0/properties/evidence/properties/status/enum",keyword:"enum",params:{allowedValues: schema49.properties.data.oneOf[0].properties.evidence.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
}
}
else {
const err24 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/0/properties/evidence/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
var valid3 = _errs29 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
}
}
}
else {
const err25 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
var _valid0 = _errs9 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
var props0 = true;
}
const _errs34 = errors;
if(errors === _errs34){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing5;
if(((((((data2.cardId === undefined) && (missing5 = "cardId")) || ((data2.registry === undefined) && (missing5 = "registry"))) || ((data2.playerName === undefined) && (missing5 = "playerName"))) || ((data2.status === undefined) && (missing5 = "status"))) || ((data2.owner === undefined) && (missing5 = "owner"))) || ((data2.evidence === undefined) && (missing5 = "evidence"))){
const err26 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/required",keyword:"required",params:{missingProperty: missing5},message:"must have required property '"+missing5+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
else {
const _errs36 = errors;
for(const key5 in data2){
if(!((((((key5 === "cardId") || (key5 === "registry")) || (key5 === "playerName")) || (key5 === "status")) || (key5 === "owner")) || (key5 === "evidence"))){
const err27 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
break;
}
}
if(_errs36 === errors){
if(data2.cardId !== undefined){
let data13 = data2.cardId;
const _errs37 = errors;
if(errors === _errs37){
if(typeof data13 === "string"){
if(func1(data13) > 64){
const err28 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
else {
if(func1(data13) < 1){
const err29 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
else {
if(!pattern6.test(data13)){
const err30 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
}
else {
const err31 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
var valid6 = _errs37 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.registry !== undefined){
let data14 = data2.registry;
const _errs39 = errors;
if(errors === _errs39){
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
let missing6;
if((((data14.chainId === undefined) && (missing6 = "chainId")) || ((data14.contractAddress === undefined) && (missing6 = "contractAddress"))) || ((data14.issuer === undefined) && (missing6 = "issuer"))){
const err32 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/1/properties/registry/required",keyword:"required",params:{missingProperty: missing6},message:"must have required property '"+missing6+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
else {
const _errs41 = errors;
for(const key6 in data14){
if(!(((key6 === "chainId") || (key6 === "contractAddress")) || (key6 === "issuer"))){
const err33 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/1/properties/registry/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
break;
}
}
if(_errs41 === errors){
if(data14.chainId !== undefined){
let data15 = data14.chainId;
const _errs42 = errors;
if(!(((typeof data15 == "number") && (!(data15 % 1) && !isNaN(data15))) && (isFinite(data15)))){
const err34 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(errors === _errs42){
if((typeof data15 == "number") && (isFinite(data15))){
if(data15 > 9007199254740991 || isNaN(data15)){
const err35 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
else {
if(data15 < 1 || isNaN(data15)){
const err36 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
}
}
var valid7 = _errs42 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data14.contractAddress !== undefined){
let data16 = data14.contractAddress;
const _errs44 = errors;
if(errors === _errs44){
if(typeof data16 === "string"){
if(!pattern4.test(data16)){
const err37 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
else {
const err38 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
var valid7 = _errs44 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data14.issuer !== undefined){
let data17 = data14.issuer;
const _errs46 = errors;
if(errors === _errs46){
if(typeof data17 === "string"){
if(!pattern4.test(data17)){
const err39 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
else {
const err40 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
var valid7 = _errs46 === errors;
}
else {
var valid7 = true;
}
}
}
}
}
}
else {
const err41 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/1/properties/registry/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
var valid6 = _errs39 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.playerName !== undefined){
const _errs48 = errors;
if(typeof data2.playerName !== "string"){
const err42 = {instancePath:instancePath+"/data/playerName",schemaPath:"#/properties/data/oneOf/1/properties/playerName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
var valid6 = _errs48 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.status !== undefined){
let data19 = data2.status;
const _errs50 = errors;
if(typeof data19 !== "string"){
const err43 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/1/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if(!(data19 === "registered")){
const err44 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/1/properties/status/enum",keyword:"enum",params:{allowedValues: schema49.properties.data.oneOf[1].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
var valid6 = _errs50 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.owner !== undefined){
let data20 = data2.owner;
const _errs52 = errors;
if(errors === _errs52){
if(data20 && typeof data20 == "object" && !Array.isArray(data20)){
let missing7;
if(((data20.address === undefined) && (missing7 = "address")) || ((data20.nickname === undefined) && (missing7 = "nickname"))){
const err45 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/1/properties/owner/required",keyword:"required",params:{missingProperty: missing7},message:"must have required property '"+missing7+"'"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
else {
const _errs54 = errors;
for(const key7 in data20){
if(!((key7 === "address") || (key7 === "nickname"))){
const err46 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/1/properties/owner/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key7},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
break;
}
}
if(_errs54 === errors){
if(data20.address !== undefined){
let data21 = data20.address;
const _errs55 = errors;
if(errors === _errs55){
if(typeof data21 === "string"){
if(!pattern4.test(data21)){
const err47 = {instancePath:instancePath+"/data/owner/address",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/address/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
else {
const err48 = {instancePath:instancePath+"/data/owner/address",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/address/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
var valid8 = _errs55 === errors;
}
else {
var valid8 = true;
}
if(valid8){
if(data20.nickname !== undefined){
let data22 = data20.nickname;
const _errs57 = errors;
if(errors === _errs57){
if(typeof data22 === "string"){
if(func1(data22) < 1){
const err49 = {instancePath:instancePath+"/data/owner/nickname",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
else {
const err50 = {instancePath:instancePath+"/data/owner/nickname",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
var valid8 = _errs57 === errors;
}
else {
var valid8 = true;
}
}
}
}
}
else {
const err51 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/1/properties/owner/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
var valid6 = _errs52 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.evidence !== undefined){
let data23 = data2.evidence;
const _errs59 = errors;
const _errs60 = errors;
let valid9 = false;
let passing1 = null;
const _errs61 = errors;
if(errors === _errs61){
if(data23 && typeof data23 == "object" && !Array.isArray(data23)){
let missing8;
if((((data23.status === undefined) && (missing8 = "status")) || ((data23.transactionHash === undefined) && (missing8 = "transactionHash"))) || ((data23.blockNumber === undefined) && (missing8 = "blockNumber"))){
const err52 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/required",keyword:"required",params:{missingProperty: missing8},message:"must have required property '"+missing8+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
else {
const _errs63 = errors;
for(const key8 in data23){
if(!(((key8 === "status") || (key8 === "transactionHash")) || (key8 === "blockNumber"))){
const err53 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key8},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
break;
}
}
if(_errs63 === errors){
if(data23.status !== undefined){
let data24 = data23.status;
const _errs64 = errors;
if(typeof data24 !== "string"){
const err54 = {instancePath:instancePath+"/data/evidence/status",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(!(data24 === "available")){
const err55 = {instancePath:instancePath+"/data/evidence/status",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/properties/status/enum",keyword:"enum",params:{allowedValues: schema49.properties.data.oneOf[1].properties.evidence.oneOf[0].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
var valid10 = _errs64 === errors;
}
else {
var valid10 = true;
}
if(valid10){
if(data23.transactionHash !== undefined){
let data25 = data23.transactionHash;
const _errs66 = errors;
if(errors === _errs66){
if(typeof data25 === "string"){
if(!pattern5.test(data25)){
const err56 = {instancePath:instancePath+"/data/evidence/transactionHash",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
else {
const err57 = {instancePath:instancePath+"/data/evidence/transactionHash",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
var valid10 = _errs66 === errors;
}
else {
var valid10 = true;
}
if(valid10){
if(data23.blockNumber !== undefined){
let data26 = data23.blockNumber;
const _errs68 = errors;
if(!(((typeof data26 == "number") && (!(data26 % 1) && !isNaN(data26))) && (isFinite(data26)))){
const err58 = {instancePath:instancePath+"/data/evidence/blockNumber",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/properties/blockNumber/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
if(errors === _errs68){
if((typeof data26 == "number") && (isFinite(data26))){
if(data26 < 0 || isNaN(data26)){
const err59 = {instancePath:instancePath+"/data/evidence/blockNumber",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/properties/blockNumber/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
}
var valid10 = _errs68 === errors;
}
else {
var valid10 = true;
}
}
}
}
}
}
else {
const err60 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
var _valid1 = _errs61 === errors;
if(_valid1){
valid9 = true;
passing1 = 0;
var props1 = true;
}
const _errs70 = errors;
if(errors === _errs70){
if(data23 && typeof data23 == "object" && !Array.isArray(data23)){
let missing9;
if((data23.status === undefined) && (missing9 = "status")){
const err61 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/1/required",keyword:"required",params:{missingProperty: missing9},message:"must have required property '"+missing9+"'"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
else {
const _errs72 = errors;
for(const key9 in data23){
if(!(key9 === "status")){
const err62 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key9},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
break;
}
}
if(_errs72 === errors){
if(data23.status !== undefined){
let data27 = data23.status;
if(typeof data27 !== "string"){
const err63 = {instancePath:instancePath+"/data/evidence/status",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/1/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
if(!(data27 === "pending")){
const err64 = {instancePath:instancePath+"/data/evidence/status",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/1/properties/status/enum",keyword:"enum",params:{allowedValues: schema49.properties.data.oneOf[1].properties.evidence.oneOf[1].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
}
}
}
else {
const err65 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
var _valid1 = _errs70 === errors;
if(_valid1 && valid9){
valid9 = false;
passing1 = [passing1, 1];
}
else {
if(_valid1){
valid9 = true;
passing1 = 1;
if(props1 !== true){
props1 = true;
}
}
}
if(!valid9){
const err66 = {instancePath:instancePath+"/data/evidence",schemaPath:"#/properties/data/oneOf/1/properties/evidence/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
else {
errors = _errs60;
if(vErrors !== null){
if(_errs60){
vErrors.length = _errs60;
}
else {
vErrors = null;
}
}
}
var valid6 = _errs59 === errors;
}
else {
var valid6 = true;
}
}
}
}
}
}
}
}
}
else {
const err67 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
var _valid0 = _errs34 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid2){
const err68 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
validate38.errors = vErrors;
return false;
}
else {
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate38.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate38.errors = vErrors;
return errors === 0;
}
validate38.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const PrepareResponse = validate39;
const schema50 = {"type":"object","additionalProperties":false,"required":["meta","data"],"properties":{"meta":{"type":"object","additionalProperties":false,"required":["mode"],"properties":{"mode":{"type":"string","enum":["mock","live"]}},"description":"mockは模擬操作、liveは設定したチェーンの実記録。mockの取引は実送信不可。"},"data":{"type":"object","additionalProperties":false,"required":["cardId","nickname","transaction"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"nickname":{"type":"string","minLength":1},"transaction":{"type":"object","additionalProperties":false,"required":["chainId","from","to","data","value"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"from":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"to":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"data":{"type":"string","pattern":"^0x(?:[0-9a-fA-F]{2})*$"},"value":{"type":"string","const":"0"}},"description":"共通転送形式。valueはweiの10進文字列。この操作は送金しない。モックのdata=0xはABI未確定のプレースホルダーで、実送信不可。nonce・gas・手数料は含めない。"}}}}};

function validate39(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate39.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.meta === undefined) && (missing0 = "meta")) || ((data.data === undefined) && (missing0 = "data"))){
validate39.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "meta") || (key0 === "data"))){
validate39.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.meta !== undefined){
let data0 = data.meta;
const _errs2 = errors;
if(errors === _errs2){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((data0.mode === undefined) && (missing1 = "mode")){
validate39.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs4 = errors;
for(const key1 in data0){
if(!(key1 === "mode")){
validate39.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs4 === errors){
if(data0.mode !== undefined){
let data1 = data0.mode;
if(typeof data1 !== "string"){
validate39.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data1 === "mock") || (data1 === "live"))){
validate39.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/enum",keyword:"enum",params:{allowedValues: schema50.properties.meta.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.data !== undefined){
let data2 = data.data;
const _errs7 = errors;
if(errors === _errs7){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing2;
if((((data2.cardId === undefined) && (missing2 = "cardId")) || ((data2.nickname === undefined) && (missing2 = "nickname"))) || ((data2.transaction === undefined) && (missing2 = "transaction"))){
validate39.errors = [{instancePath:instancePath+"/data",schemaPath:"#/properties/data/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"}];
return false;
}
else {
const _errs9 = errors;
for(const key2 in data2){
if(!(((key2 === "cardId") || (key2 === "nickname")) || (key2 === "transaction"))){
validate39.errors = [{instancePath:instancePath+"/data",schemaPath:"#/properties/data/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs9 === errors){
if(data2.cardId !== undefined){
let data3 = data2.cardId;
const _errs10 = errors;
if(errors === _errs10){
if(typeof data3 === "string"){
if(func1(data3) > 64){
validate39.errors = [{instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"}];
return false;
}
else {
if(func1(data3) < 1){
validate39.errors = [{instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
else {
if(!pattern6.test(data3)){
validate39.errors = [{instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""}];
return false;
}
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid2 = _errs10 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data2.nickname !== undefined){
let data4 = data2.nickname;
const _errs12 = errors;
if(errors === _errs12){
if(typeof data4 === "string"){
if(func1(data4) < 1){
validate39.errors = [{instancePath:instancePath+"/data/nickname",schemaPath:"#/properties/data/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"}];
return false;
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data/nickname",schemaPath:"#/properties/data/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid2 = _errs12 === errors;
}
else {
var valid2 = true;
}
if(valid2){
if(data2.transaction !== undefined){
let data5 = data2.transaction;
const _errs14 = errors;
if(errors === _errs14){
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
let missing3;
if((((((data5.chainId === undefined) && (missing3 = "chainId")) || ((data5.from === undefined) && (missing3 = "from"))) || ((data5.to === undefined) && (missing3 = "to"))) || ((data5.data === undefined) && (missing3 = "data"))) || ((data5.value === undefined) && (missing3 = "value"))){
validate39.errors = [{instancePath:instancePath+"/data/transaction",schemaPath:"#/properties/data/properties/transaction/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"}];
return false;
}
else {
const _errs16 = errors;
for(const key3 in data5){
if(!(((((key3 === "chainId") || (key3 === "from")) || (key3 === "to")) || (key3 === "data")) || (key3 === "value"))){
validate39.errors = [{instancePath:instancePath+"/data/transaction",schemaPath:"#/properties/data/properties/transaction/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs16 === errors){
if(data5.chainId !== undefined){
let data6 = data5.chainId;
const _errs17 = errors;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
validate39.errors = [{instancePath:instancePath+"/data/transaction/chainId",schemaPath:"#/properties/data/properties/transaction/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];
return false;
}
if(errors === _errs17){
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 > 9007199254740991 || isNaN(data6)){
validate39.errors = [{instancePath:instancePath+"/data/transaction/chainId",schemaPath:"#/properties/data/properties/transaction/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"}];
return false;
}
else {
if(data6 < 1 || isNaN(data6)){
validate39.errors = [{instancePath:instancePath+"/data/transaction/chainId",schemaPath:"#/properties/data/properties/transaction/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"}];
return false;
}
}
}
}
var valid3 = _errs17 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data5.from !== undefined){
let data7 = data5.from;
const _errs19 = errors;
if(errors === _errs19){
if(typeof data7 === "string"){
if(!pattern4.test(data7)){
validate39.errors = [{instancePath:instancePath+"/data/transaction/from",schemaPath:"#/properties/data/properties/transaction/properties/from/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data/transaction/from",schemaPath:"#/properties/data/properties/transaction/properties/from/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid3 = _errs19 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data5.to !== undefined){
let data8 = data5.to;
const _errs21 = errors;
if(errors === _errs21){
if(typeof data8 === "string"){
if(!pattern4.test(data8)){
validate39.errors = [{instancePath:instancePath+"/data/transaction/to",schemaPath:"#/properties/data/properties/transaction/properties/to/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""}];
return false;
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data/transaction/to",schemaPath:"#/properties/data/properties/transaction/properties/to/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid3 = _errs21 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data5.data !== undefined){
let data9 = data5.data;
const _errs23 = errors;
if(errors === _errs23){
if(typeof data9 === "string"){
if(!pattern22.test(data9)){
validate39.errors = [{instancePath:instancePath+"/data/transaction/data",schemaPath:"#/properties/data/properties/transaction/properties/data/pattern",keyword:"pattern",params:{pattern: "^0x(?:[0-9a-fA-F]{2})*$"},message:"must match pattern \""+"^0x(?:[0-9a-fA-F]{2})*$"+"\""}];
return false;
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data/transaction/data",schemaPath:"#/properties/data/properties/transaction/properties/data/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
}
var valid3 = _errs23 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data5.value !== undefined){
let data10 = data5.value;
const _errs25 = errors;
if(typeof data10 !== "string"){
validate39.errors = [{instancePath:instancePath+"/data/transaction/value",schemaPath:"#/properties/data/properties/transaction/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if("0" !== data10){
validate39.errors = [{instancePath:instancePath+"/data/transaction/value",schemaPath:"#/properties/data/properties/transaction/properties/value/const",keyword:"const",params:{allowedValue: "0"},message:"must be equal to constant"}];
return false;
}
var valid3 = _errs25 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data/transaction",schemaPath:"#/properties/data/properties/transaction/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid2 = _errs14 === errors;
}
else {
var valid2 = true;
}
}
}
}
}
}
else {
validate39.errors = [{instancePath:instancePath+"/data",schemaPath:"#/properties/data/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate39.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate39.errors = vErrors;
return errors === 0;
}
validate39.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const TransactionResponse = validate40;
const schema51 = {"type":"object","additionalProperties":false,"required":["meta","data"],"properties":{"meta":{"type":"object","additionalProperties":false,"required":["mode"],"properties":{"mode":{"type":"string","enum":["mock","live"]}},"description":"mockは模擬操作、liveは設定したチェーンの実記録。mockの取引は実送信不可。"},"data":{"oneOf":[{"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["pending"]}}},{"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status","owner","blockNumber"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["confirmed"]},"owner":{"type":"object","additionalProperties":false,"required":["address","nickname"],"properties":{"address":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"nickname":{"type":"string","minLength":1}}},"blockNumber":{"type":"integer","minimum":0}}},{"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["reverted"]}}},{"type":"object","additionalProperties":false,"required":["cardId","transactionHash","status","reason"],"properties":{"cardId":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},"transactionHash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"},"status":{"type":"string","enum":["unknown"]},"reason":{"type":"string","enum":["TRANSACTION_NOT_SEEN","RECORD_MISMATCH"]}}}]}}};

function validate40(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate40.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.meta === undefined) && (missing0 = "meta")) || ((data.data === undefined) && (missing0 = "data"))){
validate40.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "meta") || (key0 === "data"))){
validate40.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.meta !== undefined){
let data0 = data.meta;
const _errs2 = errors;
if(errors === _errs2){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((data0.mode === undefined) && (missing1 = "mode")){
validate40.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs4 = errors;
for(const key1 in data0){
if(!(key1 === "mode")){
validate40.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs4 === errors){
if(data0.mode !== undefined){
let data1 = data0.mode;
if(typeof data1 !== "string"){
validate40.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data1 === "mock") || (data1 === "live"))){
validate40.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/enum",keyword:"enum",params:{allowedValues: schema51.properties.meta.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate40.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.data !== undefined){
let data2 = data.data;
const _errs7 = errors;
const _errs8 = errors;
let valid2 = false;
let passing0 = null;
const _errs9 = errors;
if(errors === _errs9){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing2;
if((((data2.cardId === undefined) && (missing2 = "cardId")) || ((data2.transactionHash === undefined) && (missing2 = "transactionHash"))) || ((data2.status === undefined) && (missing2 = "status"))){
const err0 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
const _errs11 = errors;
for(const key2 in data2){
if(!(((key2 === "cardId") || (key2 === "transactionHash")) || (key2 === "status"))){
const err1 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs11 === errors){
if(data2.cardId !== undefined){
let data3 = data2.cardId;
const _errs12 = errors;
if(errors === _errs12){
if(typeof data3 === "string"){
if(func1(data3) > 64){
const err2 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
else {
if(func1(data3) < 1){
const err3 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
else {
if(!pattern6.test(data3)){
const err4 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
}
else {
const err5 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/0/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var valid3 = _errs12 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.transactionHash !== undefined){
let data4 = data2.transactionHash;
const _errs14 = errors;
if(errors === _errs14){
if(typeof data4 === "string"){
if(!pattern5.test(data4)){
const err6 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/0/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/0/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.status !== undefined){
let data5 = data2.status;
const _errs16 = errors;
if(typeof data5 !== "string"){
const err8 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/0/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!(data5 === "pending")){
const err9 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/0/properties/status/enum",keyword:"enum",params:{allowedValues: schema51.properties.data.oneOf[0].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
var valid3 = _errs16 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
}
else {
const err10 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
var _valid0 = _errs9 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
var props0 = true;
}
const _errs18 = errors;
if(errors === _errs18){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing3;
if((((((data2.cardId === undefined) && (missing3 = "cardId")) || ((data2.transactionHash === undefined) && (missing3 = "transactionHash"))) || ((data2.status === undefined) && (missing3 = "status"))) || ((data2.owner === undefined) && (missing3 = "owner"))) || ((data2.blockNumber === undefined) && (missing3 = "blockNumber"))){
const err11 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
else {
const _errs20 = errors;
for(const key3 in data2){
if(!(((((key3 === "cardId") || (key3 === "transactionHash")) || (key3 === "status")) || (key3 === "owner")) || (key3 === "blockNumber"))){
const err12 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
break;
}
}
if(_errs20 === errors){
if(data2.cardId !== undefined){
let data6 = data2.cardId;
const _errs21 = errors;
if(errors === _errs21){
if(typeof data6 === "string"){
if(func1(data6) > 64){
const err13 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
else {
if(func1(data6) < 1){
const err14 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
else {
if(!pattern6.test(data6)){
const err15 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
}
else {
const err16 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/1/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
var valid4 = _errs21 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data2.transactionHash !== undefined){
let data7 = data2.transactionHash;
const _errs23 = errors;
if(errors === _errs23){
if(typeof data7 === "string"){
if(!pattern5.test(data7)){
const err17 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/1/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/1/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
var valid4 = _errs23 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data2.status !== undefined){
let data8 = data2.status;
const _errs25 = errors;
if(typeof data8 !== "string"){
const err19 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/1/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(!(data8 === "confirmed")){
const err20 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/1/properties/status/enum",keyword:"enum",params:{allowedValues: schema51.properties.data.oneOf[1].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
var valid4 = _errs25 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data2.owner !== undefined){
let data9 = data2.owner;
const _errs27 = errors;
if(errors === _errs27){
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
let missing4;
if(((data9.address === undefined) && (missing4 = "address")) || ((data9.nickname === undefined) && (missing4 = "nickname"))){
const err21 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/1/properties/owner/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
else {
const _errs29 = errors;
for(const key4 in data9){
if(!((key4 === "address") || (key4 === "nickname"))){
const err22 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/1/properties/owner/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
break;
}
}
if(_errs29 === errors){
if(data9.address !== undefined){
let data10 = data9.address;
const _errs30 = errors;
if(errors === _errs30){
if(typeof data10 === "string"){
if(!pattern4.test(data10)){
const err23 = {instancePath:instancePath+"/data/owner/address",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/address/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/data/owner/address",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/address/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
var valid5 = _errs30 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data9.nickname !== undefined){
let data11 = data9.nickname;
const _errs32 = errors;
if(errors === _errs32){
if(typeof data11 === "string"){
if(func1(data11) < 1){
const err25 = {instancePath:instancePath+"/data/owner/nickname",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/nickname/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/data/owner/nickname",schemaPath:"#/properties/data/oneOf/1/properties/owner/properties/nickname/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
var valid5 = _errs32 === errors;
}
else {
var valid5 = true;
}
}
}
}
}
else {
const err27 = {instancePath:instancePath+"/data/owner",schemaPath:"#/properties/data/oneOf/1/properties/owner/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
var valid4 = _errs27 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data2.blockNumber !== undefined){
let data12 = data2.blockNumber;
const _errs34 = errors;
if(!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))){
const err28 = {instancePath:instancePath+"/data/blockNumber",schemaPath:"#/properties/data/oneOf/1/properties/blockNumber/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(errors === _errs34){
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 < 0 || isNaN(data12)){
const err29 = {instancePath:instancePath+"/data/blockNumber",schemaPath:"#/properties/data/oneOf/1/properties/blockNumber/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
var valid4 = _errs34 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
}
}
}
else {
const err30 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
var _valid0 = _errs18 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
const _errs36 = errors;
if(errors === _errs36){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing5;
if((((data2.cardId === undefined) && (missing5 = "cardId")) || ((data2.transactionHash === undefined) && (missing5 = "transactionHash"))) || ((data2.status === undefined) && (missing5 = "status"))){
const err31 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/2/required",keyword:"required",params:{missingProperty: missing5},message:"must have required property '"+missing5+"'"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
else {
const _errs38 = errors;
for(const key5 in data2){
if(!(((key5 === "cardId") || (key5 === "transactionHash")) || (key5 === "status"))){
const err32 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/2/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
break;
}
}
if(_errs38 === errors){
if(data2.cardId !== undefined){
let data13 = data2.cardId;
const _errs39 = errors;
if(errors === _errs39){
if(typeof data13 === "string"){
if(func1(data13) > 64){
const err33 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/2/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
else {
if(func1(data13) < 1){
const err34 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/2/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
else {
if(!pattern6.test(data13)){
const err35 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/2/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
}
}
else {
const err36 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/2/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
var valid6 = _errs39 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.transactionHash !== undefined){
let data14 = data2.transactionHash;
const _errs41 = errors;
if(errors === _errs41){
if(typeof data14 === "string"){
if(!pattern5.test(data14)){
const err37 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/2/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
else {
const err38 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/2/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
var valid6 = _errs41 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data2.status !== undefined){
let data15 = data2.status;
const _errs43 = errors;
if(typeof data15 !== "string"){
const err39 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/2/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(!(data15 === "reverted")){
const err40 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/2/properties/status/enum",keyword:"enum",params:{allowedValues: schema51.properties.data.oneOf[2].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
var valid6 = _errs43 === errors;
}
else {
var valid6 = true;
}
}
}
}
}
}
else {
const err41 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/2/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
var _valid0 = _errs36 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid2 = true;
passing0 = 2;
if(props0 !== true){
props0 = true;
}
}
const _errs45 = errors;
if(errors === _errs45){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing6;
if(((((data2.cardId === undefined) && (missing6 = "cardId")) || ((data2.transactionHash === undefined) && (missing6 = "transactionHash"))) || ((data2.status === undefined) && (missing6 = "status"))) || ((data2.reason === undefined) && (missing6 = "reason"))){
const err42 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/3/required",keyword:"required",params:{missingProperty: missing6},message:"must have required property '"+missing6+"'"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
else {
const _errs47 = errors;
for(const key6 in data2){
if(!((((key6 === "cardId") || (key6 === "transactionHash")) || (key6 === "status")) || (key6 === "reason"))){
const err43 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/3/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
break;
}
}
if(_errs47 === errors){
if(data2.cardId !== undefined){
let data16 = data2.cardId;
const _errs48 = errors;
if(errors === _errs48){
if(typeof data16 === "string"){
if(func1(data16) > 64){
const err44 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/3/properties/cardId/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
else {
if(func1(data16) < 1){
const err45 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/3/properties/cardId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
else {
if(!pattern6.test(data16)){
const err46 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/3/properties/cardId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]+$"},message:"must match pattern \""+"^[A-Za-z0-9_-]+$"+"\""};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
}
}
else {
const err47 = {instancePath:instancePath+"/data/cardId",schemaPath:"#/properties/data/oneOf/3/properties/cardId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
var valid7 = _errs48 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data2.transactionHash !== undefined){
let data17 = data2.transactionHash;
const _errs50 = errors;
if(errors === _errs50){
if(typeof data17 === "string"){
if(!pattern5.test(data17)){
const err48 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/3/properties/transactionHash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
else {
const err49 = {instancePath:instancePath+"/data/transactionHash",schemaPath:"#/properties/data/oneOf/3/properties/transactionHash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
var valid7 = _errs50 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data2.status !== undefined){
let data18 = data2.status;
const _errs52 = errors;
if(typeof data18 !== "string"){
const err50 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/3/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
if(!(data18 === "unknown")){
const err51 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/3/properties/status/enum",keyword:"enum",params:{allowedValues: schema51.properties.data.oneOf[3].properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
var valid7 = _errs52 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data2.reason !== undefined){
let data19 = data2.reason;
const _errs54 = errors;
if(typeof data19 !== "string"){
const err52 = {instancePath:instancePath+"/data/reason",schemaPath:"#/properties/data/oneOf/3/properties/reason/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if(!((data19 === "TRANSACTION_NOT_SEEN") || (data19 === "RECORD_MISMATCH"))){
const err53 = {instancePath:instancePath+"/data/reason",schemaPath:"#/properties/data/oneOf/3/properties/reason/enum",keyword:"enum",params:{allowedValues: schema51.properties.data.oneOf[3].properties.reason.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
var valid7 = _errs54 === errors;
}
else {
var valid7 = true;
}
}
}
}
}
}
}
else {
const err54 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/3/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
var _valid0 = _errs45 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 3];
}
else {
if(_valid0){
valid2 = true;
passing0 = 3;
if(props0 !== true){
props0 = true;
}
}
}
}
}
if(!valid2){
const err55 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
validate40.errors = vErrors;
return false;
}
else {
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate40.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate40.errors = vErrors;
return errors === 0;
}
validate40.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const ErrorResponse = validate41;
const schema52 = {"type":"object","additionalProperties":false,"required":["meta","error"],"properties":{"meta":{"type":"object","additionalProperties":false,"required":["mode"],"properties":{"mode":{"type":"string","enum":["mock","live"]}},"description":"mockは模擬操作、liveは設定したチェーンの実記録。mockの取引は実送信不可。"},"error":{"oneOf":[{"type":"object","additionalProperties":false,"required":["code","message"],"properties":{"code":{"type":"string","enum":["INVALID_INPUT","INVALID_MOCK_SCENARIO","CARD_NOT_FOUND","ALREADY_REGISTERED","WALLET_NOT_ALLOWED","CHAIN_MISMATCH","MOCK_SAMPLE_UNSUPPORTED","UPSTREAM_UNAVAILABLE","INTERNAL_ERROR","PAYLOAD_TOO_LARGE","UNSUPPORTED_MEDIA_TYPE","ORIGIN_NOT_ALLOWED","CONNECTION_MISMATCH","MULTIBAAS_AUTH_FAILED","UPSTREAM_TIMEOUT"]},"message":{"type":"string","minLength":1}}},{"type":"object","additionalProperties":false,"required":["code","message","details"],"properties":{"code":{"type":"string","const":"CONFIGURATION_MISSING"},"message":{"type":"string","minLength":1},"details":{"type":"object","additionalProperties":false,"required":["missingSettings"],"properties":{"missingSettings":{"type":"array","items":{"type":"string"},"minItems":1}}}}}]}}};

function validate41(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate41.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.meta === undefined) && (missing0 = "meta")) || ((data.error === undefined) && (missing0 = "error"))){
validate41.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "meta") || (key0 === "error"))){
validate41.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.meta !== undefined){
let data0 = data.meta;
const _errs2 = errors;
if(errors === _errs2){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((data0.mode === undefined) && (missing1 = "mode")){
validate41.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs4 = errors;
for(const key1 in data0){
if(!(key1 === "mode")){
validate41.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs4 === errors){
if(data0.mode !== undefined){
let data1 = data0.mode;
if(typeof data1 !== "string"){
validate41.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data1 === "mock") || (data1 === "live"))){
validate41.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/enum",keyword:"enum",params:{allowedValues: schema52.properties.meta.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate41.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.error !== undefined){
let data2 = data.error;
const _errs7 = errors;
const _errs8 = errors;
let valid2 = false;
let passing0 = null;
const _errs9 = errors;
if(errors === _errs9){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing2;
if(((data2.code === undefined) && (missing2 = "code")) || ((data2.message === undefined) && (missing2 = "message"))){
const err0 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf/0/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
const _errs11 = errors;
for(const key2 in data2){
if(!((key2 === "code") || (key2 === "message"))){
const err1 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs11 === errors){
if(data2.code !== undefined){
let data3 = data2.code;
const _errs12 = errors;
if(typeof data3 !== "string"){
const err2 = {instancePath:instancePath+"/error/code",schemaPath:"#/properties/error/oneOf/0/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(!(((((((((((((((data3 === "INVALID_INPUT") || (data3 === "INVALID_MOCK_SCENARIO")) || (data3 === "CARD_NOT_FOUND")) || (data3 === "ALREADY_REGISTERED")) || (data3 === "WALLET_NOT_ALLOWED")) || (data3 === "CHAIN_MISMATCH")) || (data3 === "MOCK_SAMPLE_UNSUPPORTED")) || (data3 === "UPSTREAM_UNAVAILABLE")) || (data3 === "INTERNAL_ERROR")) || (data3 === "PAYLOAD_TOO_LARGE")) || (data3 === "UNSUPPORTED_MEDIA_TYPE")) || (data3 === "ORIGIN_NOT_ALLOWED")) || (data3 === "CONNECTION_MISMATCH")) || (data3 === "MULTIBAAS_AUTH_FAILED")) || (data3 === "UPSTREAM_TIMEOUT"))){
const err3 = {instancePath:instancePath+"/error/code",schemaPath:"#/properties/error/oneOf/0/properties/code/enum",keyword:"enum",params:{allowedValues: schema52.properties.error.oneOf[0].properties.code.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var valid3 = _errs12 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.message !== undefined){
let data4 = data2.message;
const _errs14 = errors;
if(errors === _errs14){
if(typeof data4 === "string"){
if(func1(data4) < 1){
const err4 = {instancePath:instancePath+"/error/message",schemaPath:"#/properties/error/oneOf/0/properties/message/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/error/message",schemaPath:"#/properties/error/oneOf/0/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
else {
const err6 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
var _valid0 = _errs9 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
var props0 = true;
}
const _errs16 = errors;
if(errors === _errs16){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing3;
if((((data2.code === undefined) && (missing3 = "code")) || ((data2.message === undefined) && (missing3 = "message"))) || ((data2.details === undefined) && (missing3 = "details"))){
const err7 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf/1/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
else {
const _errs18 = errors;
for(const key3 in data2){
if(!(((key3 === "code") || (key3 === "message")) || (key3 === "details"))){
const err8 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
break;
}
}
if(_errs18 === errors){
if(data2.code !== undefined){
let data5 = data2.code;
const _errs19 = errors;
if(typeof data5 !== "string"){
const err9 = {instancePath:instancePath+"/error/code",schemaPath:"#/properties/error/oneOf/1/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if("CONFIGURATION_MISSING" !== data5){
const err10 = {instancePath:instancePath+"/error/code",schemaPath:"#/properties/error/oneOf/1/properties/code/const",keyword:"const",params:{allowedValue: "CONFIGURATION_MISSING"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
var valid4 = _errs19 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data2.message !== undefined){
let data6 = data2.message;
const _errs21 = errors;
if(errors === _errs21){
if(typeof data6 === "string"){
if(func1(data6) < 1){
const err11 = {instancePath:instancePath+"/error/message",schemaPath:"#/properties/error/oneOf/1/properties/message/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/error/message",schemaPath:"#/properties/error/oneOf/1/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
var valid4 = _errs21 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data2.details !== undefined){
let data7 = data2.details;
const _errs23 = errors;
if(errors === _errs23){
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
let missing4;
if((data7.missingSettings === undefined) && (missing4 = "missingSettings")){
const err13 = {instancePath:instancePath+"/error/details",schemaPath:"#/properties/error/oneOf/1/properties/details/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
else {
const _errs25 = errors;
for(const key4 in data7){
if(!(key4 === "missingSettings")){
const err14 = {instancePath:instancePath+"/error/details",schemaPath:"#/properties/error/oneOf/1/properties/details/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
break;
}
}
if(_errs25 === errors){
if(data7.missingSettings !== undefined){
let data8 = data7.missingSettings;
const _errs26 = errors;
if(errors === _errs26){
if(Array.isArray(data8)){
if(data8.length < 1){
const err15 = {instancePath:instancePath+"/error/details/missingSettings",schemaPath:"#/properties/error/oneOf/1/properties/details/properties/missingSettings/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
else {
var valid6 = true;
const len0 = data8.length;
for(let i0=0; i0<len0; i0++){
const _errs28 = errors;
if(typeof data8[i0] !== "string"){
const err16 = {instancePath:instancePath+"/error/details/missingSettings/" + i0,schemaPath:"#/properties/error/oneOf/1/properties/details/properties/missingSettings/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var valid6 = _errs28 === errors;
if(!valid6){
break;
}
}
}
}
else {
const err17 = {instancePath:instancePath+"/error/details/missingSettings",schemaPath:"#/properties/error/oneOf/1/properties/details/properties/missingSettings/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
}
}
}
else {
const err18 = {instancePath:instancePath+"/error/details",schemaPath:"#/properties/error/oneOf/1/properties/details/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
var valid4 = _errs23 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
}
else {
const err19 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
var _valid0 = _errs16 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid2){
const err20 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
validate41.errors = vErrors;
return false;
}
else {
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate41.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate41.errors = vErrors;
return errors === 0;
}
validate41.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const ConnectionResponse = validate42;
const schema53 = {"type":"object","additionalProperties":false,"required":["meta","data"],"properties":{"meta":{"type":"object","additionalProperties":false,"required":["mode"],"properties":{"mode":{"type":"string","enum":["mock","live"]}},"description":"mockは模擬操作、liveは設定したチェーンの実記録。mockの取引は実送信不可。"},"data":{"oneOf":[{"type":"object","additionalProperties":false,"required":["status","registry"],"properties":{"status":{"type":"string","const":"mock"},"registry":{"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}}}},{"type":"object","additionalProperties":false,"required":["status","network","registry","latestBlock","nicknameMaxUtf8Bytes"],"properties":{"status":{"type":"string","const":"ready"},"network":{"type":"object","additionalProperties":false,"required":["name","chainId","nativeCurrency","rpcUrls"],"properties":{"name":{"type":"string","const":"Curvegrid Testnet"},"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"nativeCurrency":{"type":"object","additionalProperties":false,"required":["name","symbol","decimals"],"properties":{"name":{"type":"string","const":"Ether"},"symbol":{"type":"string","const":"ETH"},"decimals":{"type":"integer","const":18}}},"rpcUrls":{"type":"array","minItems":1,"maxItems":1,"items":{"type":"string","pattern":"^https://"}}}},"registry":{"type":"object","additionalProperties":false,"required":["chainId","contractAddress","issuer"],"properties":{"chainId":{"type":"integer","minimum":1,"maximum":9007199254740991},"contractAddress":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"},"issuer":{"type":"string","pattern":"^0x[0-9a-fA-F]{40}$"}}},"latestBlock":{"type":"object","additionalProperties":false,"required":["number","hash"],"properties":{"number":{"type":"integer","minimum":0,"maximum":9007199254740991},"hash":{"type":"string","pattern":"^0x[0-9a-fA-F]{64}$"}}},"nicknameMaxUtf8Bytes":{"type":"integer","const":96}}}]}}};
const pattern59 = new RegExp("^https://", "u");

function validate42(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate42.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.meta === undefined) && (missing0 = "meta")) || ((data.data === undefined) && (missing0 = "data"))){
validate42.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];
return false;
}
else {
const _errs1 = errors;
for(const key0 in data){
if(!((key0 === "meta") || (key0 === "data"))){
validate42.errors = [{instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs1 === errors){
if(data.meta !== undefined){
let data0 = data.meta;
const _errs2 = errors;
if(errors === _errs2){
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
let missing1;
if((data0.mode === undefined) && (missing1 = "mode")){
validate42.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];
return false;
}
else {
const _errs4 = errors;
for(const key1 in data0){
if(!(key1 === "mode")){
validate42.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"}];
return false;
break;
}
}
if(_errs4 === errors){
if(data0.mode !== undefined){
let data1 = data0.mode;
if(typeof data1 !== "string"){
validate42.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/type",keyword:"type",params:{type: "string"},message:"must be string"}];
return false;
}
if(!((data1 === "mock") || (data1 === "live"))){
validate42.errors = [{instancePath:instancePath+"/meta/mode",schemaPath:"#/properties/meta/properties/mode/enum",keyword:"enum",params:{allowedValues: schema53.properties.meta.properties.mode.enum},message:"must be equal to one of the allowed values"}];
return false;
}
}
}
}
}
else {
validate42.errors = [{instancePath:instancePath+"/meta",schemaPath:"#/properties/meta/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
var valid0 = _errs2 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.data !== undefined){
let data2 = data.data;
const _errs7 = errors;
const _errs8 = errors;
let valid2 = false;
let passing0 = null;
const _errs9 = errors;
if(errors === _errs9){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing2;
if(((data2.status === undefined) && (missing2 = "status")) || ((data2.registry === undefined) && (missing2 = "registry"))){
const err0 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/required",keyword:"required",params:{missingProperty: missing2},message:"must have required property '"+missing2+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
const _errs11 = errors;
for(const key2 in data2){
if(!((key2 === "status") || (key2 === "registry"))){
const err1 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
break;
}
}
if(_errs11 === errors){
if(data2.status !== undefined){
let data3 = data2.status;
const _errs12 = errors;
if(typeof data3 !== "string"){
const err2 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/0/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if("mock" !== data3){
const err3 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/0/properties/status/const",keyword:"const",params:{allowedValue: "mock"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var valid3 = _errs12 === errors;
}
else {
var valid3 = true;
}
if(valid3){
if(data2.registry !== undefined){
let data4 = data2.registry;
const _errs14 = errors;
if(errors === _errs14){
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
let missing3;
if((((data4.chainId === undefined) && (missing3 = "chainId")) || ((data4.contractAddress === undefined) && (missing3 = "contractAddress"))) || ((data4.issuer === undefined) && (missing3 = "issuer"))){
const err4 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/0/properties/registry/required",keyword:"required",params:{missingProperty: missing3},message:"must have required property '"+missing3+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
else {
const _errs16 = errors;
for(const key3 in data4){
if(!(((key3 === "chainId") || (key3 === "contractAddress")) || (key3 === "issuer"))){
const err5 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/0/properties/registry/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
break;
}
}
if(_errs16 === errors){
if(data4.chainId !== undefined){
let data5 = data4.chainId;
const _errs17 = errors;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err6 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(errors === _errs17){
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 > 9007199254740991 || isNaN(data5)){
const err7 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
else {
if(data5 < 1 || isNaN(data5)){
const err8 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
}
var valid4 = _errs17 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data4.contractAddress !== undefined){
let data6 = data4.contractAddress;
const _errs19 = errors;
if(errors === _errs19){
if(typeof data6 === "string"){
if(!pattern4.test(data6)){
const err9 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
var valid4 = _errs19 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data4.issuer !== undefined){
let data7 = data4.issuer;
const _errs21 = errors;
if(errors === _errs21){
if(typeof data7 === "string"){
if(!pattern4.test(data7)){
const err11 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/0/properties/registry/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
var valid4 = _errs21 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
}
else {
const err13 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/0/properties/registry/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
var valid3 = _errs14 === errors;
}
else {
var valid3 = true;
}
}
}
}
}
else {
const err14 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
var _valid0 = _errs9 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
var props0 = true;
}
const _errs23 = errors;
if(errors === _errs23){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
let missing4;
if((((((data2.status === undefined) && (missing4 = "status")) || ((data2.network === undefined) && (missing4 = "network"))) || ((data2.registry === undefined) && (missing4 = "registry"))) || ((data2.latestBlock === undefined) && (missing4 = "latestBlock"))) || ((data2.nicknameMaxUtf8Bytes === undefined) && (missing4 = "nicknameMaxUtf8Bytes"))){
const err15 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/required",keyword:"required",params:{missingProperty: missing4},message:"must have required property '"+missing4+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
else {
const _errs25 = errors;
for(const key4 in data2){
if(!(((((key4 === "status") || (key4 === "network")) || (key4 === "registry")) || (key4 === "latestBlock")) || (key4 === "nicknameMaxUtf8Bytes"))){
const err16 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
break;
}
}
if(_errs25 === errors){
if(data2.status !== undefined){
let data8 = data2.status;
const _errs26 = errors;
if(typeof data8 !== "string"){
const err17 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/1/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if("ready" !== data8){
const err18 = {instancePath:instancePath+"/data/status",schemaPath:"#/properties/data/oneOf/1/properties/status/const",keyword:"const",params:{allowedValue: "ready"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
var valid5 = _errs26 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data2.network !== undefined){
let data9 = data2.network;
const _errs28 = errors;
if(errors === _errs28){
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
let missing5;
if(((((data9.name === undefined) && (missing5 = "name")) || ((data9.chainId === undefined) && (missing5 = "chainId"))) || ((data9.nativeCurrency === undefined) && (missing5 = "nativeCurrency"))) || ((data9.rpcUrls === undefined) && (missing5 = "rpcUrls"))){
const err19 = {instancePath:instancePath+"/data/network",schemaPath:"#/properties/data/oneOf/1/properties/network/required",keyword:"required",params:{missingProperty: missing5},message:"must have required property '"+missing5+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
else {
const _errs30 = errors;
for(const key5 in data9){
if(!((((key5 === "name") || (key5 === "chainId")) || (key5 === "nativeCurrency")) || (key5 === "rpcUrls"))){
const err20 = {instancePath:instancePath+"/data/network",schemaPath:"#/properties/data/oneOf/1/properties/network/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
break;
}
}
if(_errs30 === errors){
if(data9.name !== undefined){
let data10 = data9.name;
const _errs31 = errors;
if(typeof data10 !== "string"){
const err21 = {instancePath:instancePath+"/data/network/name",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if("Curvegrid Testnet" !== data10){
const err22 = {instancePath:instancePath+"/data/network/name",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/name/const",keyword:"const",params:{allowedValue: "Curvegrid Testnet"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
var valid6 = _errs31 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data9.chainId !== undefined){
let data11 = data9.chainId;
const _errs33 = errors;
if(!(((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11))) && (isFinite(data11)))){
const err23 = {instancePath:instancePath+"/data/network/chainId",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(errors === _errs33){
if((typeof data11 == "number") && (isFinite(data11))){
if(data11 > 9007199254740991 || isNaN(data11)){
const err24 = {instancePath:instancePath+"/data/network/chainId",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
else {
if(data11 < 1 || isNaN(data11)){
const err25 = {instancePath:instancePath+"/data/network/chainId",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
}
var valid6 = _errs33 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data9.nativeCurrency !== undefined){
let data12 = data9.nativeCurrency;
const _errs35 = errors;
if(errors === _errs35){
if(data12 && typeof data12 == "object" && !Array.isArray(data12)){
let missing6;
if((((data12.name === undefined) && (missing6 = "name")) || ((data12.symbol === undefined) && (missing6 = "symbol"))) || ((data12.decimals === undefined) && (missing6 = "decimals"))){
const err26 = {instancePath:instancePath+"/data/network/nativeCurrency",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/required",keyword:"required",params:{missingProperty: missing6},message:"must have required property '"+missing6+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
else {
const _errs37 = errors;
for(const key6 in data12){
if(!(((key6 === "name") || (key6 === "symbol")) || (key6 === "decimals"))){
const err27 = {instancePath:instancePath+"/data/network/nativeCurrency",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
break;
}
}
if(_errs37 === errors){
if(data12.name !== undefined){
let data13 = data12.name;
const _errs38 = errors;
if(typeof data13 !== "string"){
const err28 = {instancePath:instancePath+"/data/network/nativeCurrency/name",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if("Ether" !== data13){
const err29 = {instancePath:instancePath+"/data/network/nativeCurrency/name",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/properties/name/const",keyword:"const",params:{allowedValue: "Ether"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var valid7 = _errs38 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data12.symbol !== undefined){
let data14 = data12.symbol;
const _errs40 = errors;
if(typeof data14 !== "string"){
const err30 = {instancePath:instancePath+"/data/network/nativeCurrency/symbol",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/properties/symbol/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
if("ETH" !== data14){
const err31 = {instancePath:instancePath+"/data/network/nativeCurrency/symbol",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/properties/symbol/const",keyword:"const",params:{allowedValue: "ETH"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
var valid7 = _errs40 === errors;
}
else {
var valid7 = true;
}
if(valid7){
if(data12.decimals !== undefined){
let data15 = data12.decimals;
const _errs42 = errors;
if(!(((typeof data15 == "number") && (!(data15 % 1) && !isNaN(data15))) && (isFinite(data15)))){
const err32 = {instancePath:instancePath+"/data/network/nativeCurrency/decimals",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/properties/decimals/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(18 !== data15){
const err33 = {instancePath:instancePath+"/data/network/nativeCurrency/decimals",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/properties/decimals/const",keyword:"const",params:{allowedValue: 18},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
var valid7 = _errs42 === errors;
}
else {
var valid7 = true;
}
}
}
}
}
}
else {
const err34 = {instancePath:instancePath+"/data/network/nativeCurrency",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/nativeCurrency/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
var valid6 = _errs35 === errors;
}
else {
var valid6 = true;
}
if(valid6){
if(data9.rpcUrls !== undefined){
let data16 = data9.rpcUrls;
const _errs44 = errors;
if(errors === _errs44){
if(Array.isArray(data16)){
if(data16.length > 1){
const err35 = {instancePath:instancePath+"/data/network/rpcUrls",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/rpcUrls/maxItems",keyword:"maxItems",params:{limit: 1},message:"must NOT have more than 1 items"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
else {
if(data16.length < 1){
const err36 = {instancePath:instancePath+"/data/network/rpcUrls",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/rpcUrls/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
else {
var valid8 = true;
const len0 = data16.length;
for(let i0=0; i0<len0; i0++){
let data17 = data16[i0];
const _errs46 = errors;
if(errors === _errs46){
if(typeof data17 === "string"){
if(!pattern59.test(data17)){
const err37 = {instancePath:instancePath+"/data/network/rpcUrls/" + i0,schemaPath:"#/properties/data/oneOf/1/properties/network/properties/rpcUrls/items/pattern",keyword:"pattern",params:{pattern: "^https://"},message:"must match pattern \""+"^https://"+"\""};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
else {
const err38 = {instancePath:instancePath+"/data/network/rpcUrls/" + i0,schemaPath:"#/properties/data/oneOf/1/properties/network/properties/rpcUrls/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
var valid8 = _errs46 === errors;
if(!valid8){
break;
}
}
}
}
}
else {
const err39 = {instancePath:instancePath+"/data/network/rpcUrls",schemaPath:"#/properties/data/oneOf/1/properties/network/properties/rpcUrls/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
var valid6 = _errs44 === errors;
}
else {
var valid6 = true;
}
}
}
}
}
}
}
else {
const err40 = {instancePath:instancePath+"/data/network",schemaPath:"#/properties/data/oneOf/1/properties/network/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
var valid5 = _errs28 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data2.registry !== undefined){
let data18 = data2.registry;
const _errs48 = errors;
if(errors === _errs48){
if(data18 && typeof data18 == "object" && !Array.isArray(data18)){
let missing7;
if((((data18.chainId === undefined) && (missing7 = "chainId")) || ((data18.contractAddress === undefined) && (missing7 = "contractAddress"))) || ((data18.issuer === undefined) && (missing7 = "issuer"))){
const err41 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/1/properties/registry/required",keyword:"required",params:{missingProperty: missing7},message:"must have required property '"+missing7+"'"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
else {
const _errs50 = errors;
for(const key7 in data18){
if(!(((key7 === "chainId") || (key7 === "contractAddress")) || (key7 === "issuer"))){
const err42 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/1/properties/registry/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key7},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
break;
}
}
if(_errs50 === errors){
if(data18.chainId !== undefined){
let data19 = data18.chainId;
const _errs51 = errors;
if(!(((typeof data19 == "number") && (!(data19 % 1) && !isNaN(data19))) && (isFinite(data19)))){
const err43 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/chainId/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if(errors === _errs51){
if((typeof data19 == "number") && (isFinite(data19))){
if(data19 > 9007199254740991 || isNaN(data19)){
const err44 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/chainId/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
else {
if(data19 < 1 || isNaN(data19)){
const err45 = {instancePath:instancePath+"/data/registry/chainId",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/chainId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
}
}
var valid9 = _errs51 === errors;
}
else {
var valid9 = true;
}
if(valid9){
if(data18.contractAddress !== undefined){
let data20 = data18.contractAddress;
const _errs53 = errors;
if(errors === _errs53){
if(typeof data20 === "string"){
if(!pattern4.test(data20)){
const err46 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/contractAddress/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
else {
const err47 = {instancePath:instancePath+"/data/registry/contractAddress",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/contractAddress/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
var valid9 = _errs53 === errors;
}
else {
var valid9 = true;
}
if(valid9){
if(data18.issuer !== undefined){
let data21 = data18.issuer;
const _errs55 = errors;
if(errors === _errs55){
if(typeof data21 === "string"){
if(!pattern4.test(data21)){
const err48 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/issuer/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{40}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{40}$"+"\""};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
else {
const err49 = {instancePath:instancePath+"/data/registry/issuer",schemaPath:"#/properties/data/oneOf/1/properties/registry/properties/issuer/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
var valid9 = _errs55 === errors;
}
else {
var valid9 = true;
}
}
}
}
}
}
else {
const err50 = {instancePath:instancePath+"/data/registry",schemaPath:"#/properties/data/oneOf/1/properties/registry/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
var valid5 = _errs48 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data2.latestBlock !== undefined){
let data22 = data2.latestBlock;
const _errs57 = errors;
if(errors === _errs57){
if(data22 && typeof data22 == "object" && !Array.isArray(data22)){
let missing8;
if(((data22.number === undefined) && (missing8 = "number")) || ((data22.hash === undefined) && (missing8 = "hash"))){
const err51 = {instancePath:instancePath+"/data/latestBlock",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/required",keyword:"required",params:{missingProperty: missing8},message:"must have required property '"+missing8+"'"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
else {
const _errs59 = errors;
for(const key8 in data22){
if(!((key8 === "number") || (key8 === "hash"))){
const err52 = {instancePath:instancePath+"/data/latestBlock",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key8},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
break;
}
}
if(_errs59 === errors){
if(data22.number !== undefined){
let data23 = data22.number;
const _errs60 = errors;
if(!(((typeof data23 == "number") && (!(data23 % 1) && !isNaN(data23))) && (isFinite(data23)))){
const err53 = {instancePath:instancePath+"/data/latestBlock/number",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/properties/number/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
if(errors === _errs60){
if((typeof data23 == "number") && (isFinite(data23))){
if(data23 > 9007199254740991 || isNaN(data23)){
const err54 = {instancePath:instancePath+"/data/latestBlock/number",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/properties/number/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9007199254740991},message:"must be <= 9007199254740991"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
else {
if(data23 < 0 || isNaN(data23)){
const err55 = {instancePath:instancePath+"/data/latestBlock/number",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/properties/number/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
}
}
var valid10 = _errs60 === errors;
}
else {
var valid10 = true;
}
if(valid10){
if(data22.hash !== undefined){
let data24 = data22.hash;
const _errs62 = errors;
if(errors === _errs62){
if(typeof data24 === "string"){
if(!pattern5.test(data24)){
const err56 = {instancePath:instancePath+"/data/latestBlock/hash",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/properties/hash/pattern",keyword:"pattern",params:{pattern: "^0x[0-9a-fA-F]{64}$"},message:"must match pattern \""+"^0x[0-9a-fA-F]{64}$"+"\""};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
else {
const err57 = {instancePath:instancePath+"/data/latestBlock/hash",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/properties/hash/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
var valid10 = _errs62 === errors;
}
else {
var valid10 = true;
}
}
}
}
}
else {
const err58 = {instancePath:instancePath+"/data/latestBlock",schemaPath:"#/properties/data/oneOf/1/properties/latestBlock/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
var valid5 = _errs57 === errors;
}
else {
var valid5 = true;
}
if(valid5){
if(data2.nicknameMaxUtf8Bytes !== undefined){
let data25 = data2.nicknameMaxUtf8Bytes;
const _errs64 = errors;
if(!(((typeof data25 == "number") && (!(data25 % 1) && !isNaN(data25))) && (isFinite(data25)))){
const err59 = {instancePath:instancePath+"/data/nicknameMaxUtf8Bytes",schemaPath:"#/properties/data/oneOf/1/properties/nicknameMaxUtf8Bytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
if(96 !== data25){
const err60 = {instancePath:instancePath+"/data/nicknameMaxUtf8Bytes",schemaPath:"#/properties/data/oneOf/1/properties/nicknameMaxUtf8Bytes/const",keyword:"const",params:{allowedValue: 96},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
var valid5 = _errs64 === errors;
}
else {
var valid5 = true;
}
}
}
}
}
}
}
}
else {
const err61 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
}
var _valid0 = _errs23 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid2){
const err62 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
validate42.errors = vErrors;
return false;
}
else {
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
}
var valid0 = _errs7 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate42.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];
return false;
}
}
validate42.errors = vErrors;
return errors === 0;
}
validate42.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

