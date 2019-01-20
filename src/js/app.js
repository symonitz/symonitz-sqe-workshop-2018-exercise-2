import $ from 'jquery';
import {subtitue} from './code-analyzer';
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let params = $('#paramsPlaceHolder').val();
        let parsedCode = subtitue(codeToParse, params);
        $('#parsedCode').html(parsedCode);
    });
});
