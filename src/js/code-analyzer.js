import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

//var esprima = require('esprima');
//var escodegen = require('escodegen');
// const parseCode = (codeToParse) => {
//     return esprima.parseScript(codeToParse, {loc:true});
// };

function createElementList(params){
    let res = [];
    let keys  = Object.keys(params);
    for(let i = 0; i < keys.length; i++){
        var element = buildElement(keys[i], params[keys[i]]);
        res.push(element);
    }
    return res;
}

function saveGlobals(code, start_ind, params){
    for(let i = start_ind; i < code.length; i++){
        if(code[i]['type'] !== 'VariableDeclaration')
            return params;
        else{
            let declaration = code[i]['declarations'][0];
            let var_name = declaration['id']['name'];
            let var_val = produceValueVarDeclar(declaration['init']);
            let element = buildElement(var_name, var_val);
            params.push(element);
        }
    }
    return params;
}

function findFunctionDeclaration(code){
    for(let i = 0; i < code.length; i++){
        if(code[i]['type'] === 'FunctionDeclaration')
            return code[i];
    }
}

export {subtitue};
function subtitue(code, params){
    let codeParsed = esprima.parseScript(code, {loc:true});
    let arr = [];
    arr.push([]);
    var globals;
    let ifLines = [];
    if(codeParsed['body'][0]['type'] === 'VariableDeclaration'){
        globals = saveGlobals(codeParsed['body'], 0, []);  //params);
        let funcDeclare = findFunctionDeclaration(codeParsed['body']);
        arr = createAssignments(funcDeclare['body'] , arr, []);
        codeParsed = clean_ass(codeParsed, []);}
    else {
        arr = createAssignments(codeParsed['body'][0]['body'], arr, []);
        codeParsed = clean_ass(codeParsed, []);
        globals = saveGlobals(codeParsed['body'], 1, []);}
    let codeGenerated = escodegen.generate(codeParsed);
    removeParams(codeParsed, globals, params, ifLines);
    return  colorPlace(codeGenerated, ifLines);}
// remove all variable to an integer or whatever

function removeParams(codeParsed, globals, params, ifLines) {
    params = JSON.parse(params);
    params = createElementList(params);
    globals = globals.concat(params);
    // if (codeParsed['body'][0]['type'] === 'VariableDeclaration') {
    //     createAssignments(findFunctionDeclaration(codeParsed['body'])['body'] , [globals], ifLines);
    //     codeParsed = clean_ass(codeParsed, []);
    // }
    //else{
    createAssignments(codeParsed['body'][0]['body'], [globals], ifLines);
    codeParsed = clean_ass(codeParsed, []);
    //}
}

function colorPlace(code, ifLines){
    let lines = code.split('\n');
    let j = 0;
    for(let i = 0; i < lines.length; i++) {
        if(lines[i].includes('if (') || lines[i].includes('while(')) {
            let isGreen = ifLines[j][0];
            if(isGreen)
                lines[i] = '<span style="color: green; ">' + lines[i] + '</span>';
            else
                lines[i] = '<span style="color: red; ">' + lines[i] + '</span>';
            j++;
            //lines[i] = lines[i] + '\n';
        }
    }
    return lines;
}


//check where we create the eleme`nt
function sub(identifier, assignments){
    let ret_val = 0;
    for(let i = assignments.length-1; i >=0; i--){
        for(let j = 0; j< assignments[i].length;j++){
            let element = assignments[i][j];
            if(element['name'] === identifier){
                ret_val = element['val'];
                return ret_val;
            }
        }
    }
    return identifier;
}


function createAssignments(code, assignments, ifLines){
    if(Array.isArray(code)){
        assignments = arrayCase(code, assignments, ifLines);
    }
    else{
        assignments = dictionaryCase(code, assignments, ifLines);
    }
    return assignments;
}



function arrayCase(codeForAssignments, assignments, ifLines){
    for(let i = 0; i < codeForAssignments.length; i++){
        assignments = savingAssignments(codeForAssignments[i], assignments, ifLines);
    }
    return assignments;
}

function copyList(list){
    let ans = [];
    for(let i=0;i < list.length; i++){
        ans.push(buildElement(list[i]['name'], list[i]['val']));
    }
    return ans;
}


function blockStatement(key, codeForAssignments, assignments){
    if(key === 'type' && codeForAssignments[key] === 'BlockStatement'){
        let new_env = copyList(assignments[assignments.length-1]);
        assignments.push(new_env);
        return true;
    }
    return false;
}


function dictionaryCase(codeForAssignments, assignments, ifLines){
    let flag = false;
    for(let key in codeForAssignments){
        flag =  flag || blockStatement(key, codeForAssignments, assignments);
        if(key !== 'type' && key !== 'sourceType')
            assignments = savingAssignments(codeForAssignments[key], assignments, ifLines);
    }
    assignments = ifFoundBlockStatement(assignments);
    return assignments;
}

function ifFoundBlockStatement(assignments, flag) {
    if(flag)
        return assignments.slice(0, assignments.length-1);
    return assignments;
}



function varDeclaration(varDeclarationsCode, assignments){
    // saving the name of the variable we will subtitue, and the line it started. All bigger lines can use it
    let var_name = varDeclarationsCode['id']['name'];
    let var_val = produceValueVarDeclar(varDeclarationsCode['init'], assignments);
    var element = buildElement(var_name, var_val);
    let flag = false;
    for(let j = 0; j< assignments[assignments.length-1].length;j++){
        let element = assignments[assignments.length-1][j];
        if(element['name'] === var_name){
            element['val'] = var_val;
            flag = true;
        }
    }
    if(!flag)
        assignments[assignments.length-1].push(element);

}

// this function assume that first we do let or var and latter only can apply an assignemnt expression.
// as a result we not build elements but only update the exist ones.

function assignExpr(assignExprCode, assignments) {
    let var_name = assignExprCode['left']['name'];
    let var_val = produceValueVarAss(assignExprCode['right'], assignments);
    assignExprCode['right'] = clearExpression(esprima.parseScript(var_val));
    let i = assignments.length-1;
    for(let j = 0; j< assignments[i].length;j++){
        let element = assignments[i][j];
        if(element['name'] === var_name){
            element['val'] = var_val;
        }
    }
}


function buildElement(name, val) {
    var element = {};
    element['name'] = name;
    element['val'] = val;
    return element;
}

function savingAssignments(codeForAssignments, assignments, ifLines) {
    let flag = false;
    let statements = ['WhileStatement', 'IfStatement', 'ReturnStatement'];
    switch (codeForAssignments['type']) {
    case 'VariableDeclaration':
        codeForAssignments = codeForAssignments['declarations'];
        for(let i = 0;i < codeForAssignments.length;i++){
            varDeclaration(codeForAssignments[i], assignments);}
        break;
    case 'AssignmentExpression':
        assignExpr(codeForAssignments, assignments);
        break;
    default:
        statements.forEach(function(state){
            if(codeForAssignments['type'] === state){
                subtitueCode(codeForAssignments, assignments, ifLines);
                flag = true;}});
        if(!flag)
            assignments = createAssignments(codeForAssignments, assignments, ifLines);}
    return assignments;}

// produces value functions

function produceValueVarDeclar(codeToEval, assignments){
    let ret_val = 0;
    switch(codeToEval['type']){
    case 'Identifier':
        ret_val = sub(codeToEval['name'], assignments, codeToEval);
        return  ret_val;
    case 'Literal':
        return codeToEval['value'];
    case 'BinaryExpression':
        return binExpr(codeToEval, assignments);
    }
}


function produceValueVarAss(codeToEval, assignments){
    return produceValueVarDeclar(codeToEval, assignments);
}


//helper functions

function binExpr(codeToEval, assignments) {
    let op = codeToEval['operator'];
    let left = codeToEval['left'];
    let right = codeToEval['right'];
    left = produceValueVarDeclar(left, assignments);
    right = produceValueVarDeclar(right, assignments);
    return left + op + right;
}
function subtitueCode(code, expr, ifLines){
    switch(code['type']){
    case 'ReturnStatement':
        replaceReturnStatement(code,expr);
        break;
    case 'IfStatement':
        expr = replaceIfStatement(code,expr, ifLines);
        break;
    case 'WhileStatement':
        expr = replaceWhileStatement(code, expr, ifLines);
    }
}

function replaceReturnStatement(code, expr){
    code['argument'] = clearExpression(esprima.parseScript(produceValueVarDeclar(code['argument'], expr)));
}

function evalAvailable(assignments){
    let i = assignments.length-1;
    for(let j = 0; j < assignments[i].length; j++){
        try{
            eval(assignments[i][j]['val']);
        }
        catch(err){
            return false;
        }
    }
    let flag =  assignments[i].length > 0;
    return flag;
}


function replaceWhileStatement(code, assignments ,ifLines){
    let temp = produceValueVarDeclar(code['test'], assignments);
    if(evalAvailable(assignments)){
        ifLines.push([eval(temp), code.loc.start.line]);
    }

    code['test'] = clearExpression(esprima.parseScript(produceValueVarDeclar(code['test'], assignments)));
    assignments = createAssignments(code['body'], assignments, ifLines);
    return assignments;
}


function replaceIfStatement(code, assignments, ifLines){
    //ifLines.push(code.test.loc.start.line);
    //ifLines.push(eval(produceValueVarDeclar(code['test'], expr)));
    code ['test'] = clearExpression(esprima.parseScript(produceValueVarDeclar(code['test'], assignments)));
    let temp = produceValueVarDeclar(code['test'], assignments);
    if(evalAvailable(assignments)) {
        ifLines.push([eval(temp), code.loc.start.line]);
    }
    assignments = savingAssignments(code['consequent'], assignments, ifLines);
    if(code['alternate']!== null)
        assignments = savingAssignments(code['alternate'], assignments, ifLines);
    return assignments;
}

function clearExpression(code){
    return code['body'][0]['expression'];
}


function clean_ass(code, locals){
    // if(Array.isArray(code))
    //     code = clean_ass_array(code, locals);
    // else
    code = clean_ass_dict(code, locals);
    return code;
}


function clean_ass_dict(code, locals){
    for(let key in code){
        if(Array.isArray(code[key]))
            code[key] = clean_ass_array(code[key], locals);
        else if(code[key] != null && code[key]['type'] !== undefined)
            code[key] = clean_ass(code[key], locals);
    }
    return code;
}

function isExpressiontStatement(expression){
    let type = expression['type'];
    let exprType = expression['expression'];
    return (type === 'ExpressionStatement') && (exprType['type'] === 'AssignmentExpression');
}

function isAssignmentExpression(expr, locals) {
    let ans = false;
    let expression = expr['expression'];
    if(expression !== undefined)
        ans = isExpressiontStatement(expr);
    if(ans){
        let left = expression['left'];
        for(let i = 0; i < locals.length; i++){
            if(locals[i] === left['name'])
                return true;
        }
        return false;
    }
}

function clean_ass_array(code, locals) {
    let codeCopy = code.slice();
    for (let i = 0; i < code.length; i++) {
        if (code[i]['type'] === 'VariableDeclaration') {
            saveLocals(code[i], locals);
            codeCopy.splice(codeCopy.indexOf(code[i]), 1);
        }
        else if (isAssignmentExpression(code[i], locals))
            codeCopy.splice(codeCopy.indexOf(code[i]), 1);
        // else if (Array.isArray(code[i]))
        //     code[i] = clean_ass_array(code[i], locals);
        else
            code[i] = clean_ass(code[i], locals);
    }
    return codeCopy;
}


function saveLocals(code, locals){
    let declarations = code['declarations'];
    for(let i = 0; i < declarations.length; i++){
        locals.push(declarations[i]['id']['name']);
    }
}
