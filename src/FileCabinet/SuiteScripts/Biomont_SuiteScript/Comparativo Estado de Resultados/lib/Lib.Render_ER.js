/**
 * @NApiVersion 2.1
 */
define(['N', './Lib.Basic_ER'],

    function (N, Basic) {

        const { file, render } = N;

        function getDefaultStyle() {

            let style = file.load('../pub/viewerModel_ER.css').url;

            return `<link rel="stylesheet" href="${style}">`;
        }

        return {
            getDefaultStyle,
        }

    });
