/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['../lib/Lib.ServerWidget_ER', '../lib/Lib.ReportManager_ER', '../lib/Lib.Basic_ER'],

    function (ServerWidget, ReportManager, Basic) {
        /** despliegue: customdeploy_rep_comparativo_er */
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

                    ServerWidget.setInput(params);

                    ServerWidget.createReportForm();

                    ServerWidget.createMainGroup();

                    ServerWidget.createCriteriaGroup();

                    let selectedReportHtml = '';

                    switch (ServerWidget.selectedReport()) {

                        case Basic.Data.Report.GASTOS_INDIRECTOS: {
                            log.debug('Start Report', '-- Gastos Indirectos Report --');
                            selectedReportHtml = new ReportManager.GastosIndirectosFabricacionReport(params).print();
                            log.debug('End Report', '-- Gastos Indirectos Report --');
                            break;
                        }
                        case Basic.Data.Report.GASTOS_ADM_OP: {
                            log.debug('Start Report', '-- Gastos Administrativos Operacion Report --');
                            selectedReportHtml = new ReportManager.GastosAdministrativosOperacion(params).print();
                            log.debug('End Report', '-- Gastos Administrativos Operacion Report --');
                            break;
                        }
                        case Basic.Data.Report.GASTOS_ADM_OF: {
                            log.debug('Start Report', '-- Gastos Administrativos Oficina Report --');
                            selectedReportHtml = new ReportManager.GastosAdministrativosOficina(params).print();
                            log.debug('End Report', '-- Gastos Administrativos Oficina Report --');
                            break;
                        }
                        case Basic.Data.Report.GASTOS_VENTAS: {
                            log.debug('Start Report', '-- Gastos Ventas Report --');
                            selectedReportHtml = new ReportManager.GastosVentas(params).print();
                            log.debug('End Report', '-- Gastos Ventas Report --');
                            break;
                        }
                    }


                    ServerWidget.createViewerModel(selectedReportHtml);

                    let reportForm = ServerWidget.getForm();

                    reportForm.clientScriptModulePath = './Client.ViewerComparativeReportManager_ER'

                    scriptContext.response.writePage(reportForm);
                } else {

                    ServerWidget.loadReportForm(scriptContext.request.parameters);

                }
            } catch (err) {
                log.error('Err', err);
                scriptContext.response.write(JSON.stringify(err));
            }

        }

        return { onRequest }

    });
