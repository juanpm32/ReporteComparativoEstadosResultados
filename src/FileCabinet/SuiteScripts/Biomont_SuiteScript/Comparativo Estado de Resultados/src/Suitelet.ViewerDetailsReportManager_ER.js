/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['../lib/Lib.ServerWidget_ER', '../lib/Lib.ReportManager_ER', '../lib/Lib.Basic_ER'],

    function (ServerWidget, ReportManager, Basic) {
  
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {

            try {
                if (scriptContext.request.method == 'GET') {

                    let params = scriptContext.request.parameters;

                    ServerWidget.createReporteDetailsForm();

                    let selectedReportHtml = new ReportManager.GastosTransactiones(params).print();

                    ServerWidget.createViewerModel(selectedReportHtml);

                    let reportForm = ServerWidget.getForm();

                    scriptContext.response.writePage(reportForm);
                }
            } catch (err) {
                log.error('Err', err);
                scriptContext.response.write(JSON.stringify(err));
            }

        }

        return { onRequest }

    });
