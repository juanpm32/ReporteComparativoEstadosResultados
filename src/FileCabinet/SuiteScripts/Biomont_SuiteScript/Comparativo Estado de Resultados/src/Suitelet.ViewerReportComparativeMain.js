/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N'],

    (N) => {

        const { redirect, file, search, format, runtime, render } = N;
        const { serverWidget } = N.ui;

        const SUITELET_RECORD = {
            fields: {
                report: 'custpage_report_criteria_report',
                decimal: 'custpage_report_criteria_decimal',
                subsidiary: 'custpage_report_criteria_subsidiary',
                view: 'custpage_report_criteria_view',
                year: 'custpage_report_criteria_year',
                month: 'custpage_report_criteria_month'
            },
            /*buttons: {
                generate: 'custpage_report_button_visualize',
                export: 'custpage_report_button_export_xls'
            }*/
        }

        const STATIC_DATA = {
            reports: {
                1: 'P&L por Mercado',
                2: 'P&L por Linea Farmacéutica',
                3: 'P&L por Cantidades (Por Linea y Mercado)',
                4: 'P&L por Centro de Costo Comercial'
            },
            type_report:{
                'PL_MERCADO': 1,
                'PL_LINEA': 2,
                'PL_CANTIDADES': 3,
                'PL_CENTROCOSTO': 4,
            },
            viewForm: {
                'A': 'Detallada',
                'B': 'Anual',
                'C': 'Trimestral',
                'D': 'Mensual'
            }
        }

        const createAccountingPeriodYear = () => {

            let result = [];
            let currentDate = format.format({ type: format.Type.DATE, value: new Date() });

            search.create({
                type: 'accountingperiod',
                filters:
                    [
                        ["isyear", "is", "T"],
                        'AND',
                        ['startdate', 'onorbefore', currentDate]
                    ],
                columns: [
                    { name: 'startdate', sort: 'DESC', label: 'start' },
                    { name: 'internalid', label: 'id' },
                    { name: "periodname", label: "Name" }
                ]
            }).run().each(node => {
                let { columns } = node;
                result.push({
                    id: node.getValue(columns[1]),
                    text: node.getValue(columns[2])
                });
                return true;
            });

            return result;
        }

        const createAccountingPeriodByYear = (year) => {

            let result = [];

            search.create({
                type: 'accountingperiod',
                filters:
                    [
                        ["parent", "anyof", year],
                        "AND",
                        ["isquarter", "is", "F"],
                        "AND",
                        ["isyear", "is", "F"],
                        'AND',
                        ["isadjust", "is", "F"]
                    ],
                columns: [
                    { name: 'startdate', sort: 'DESC', label: 'start' },
                    { name: 'internalid', label: 'id' },
                    { name: "periodname", label: "Name" }
                ]
            }).run().each(node => {
                let { columns } = node;
                result.push({
                    id: node.getValue(columns[1]),
                    text: node.getValue(columns[2])
                });
                return true;
            });

            return result;
        }

        const onRequest = (scriptContext) => {
            try {  

                let params = scriptContext.request.parameters;

                if (scriptContext.request.method == 'GET') {

                    // Crear el formulario
                    var form = serverWidget.createForm({
                        title: 'Reporte Comparativo Profit and Loss'
                    });

                    // Agregar botón para generar el reporte en el formulario
                    form.addSubmitButton({
                        label: 'Generar'
                    });

                    //************************************************
                    // Agregamos grupo1 en el formulario para el campo tipo de reporte
                    let group1 = form.addFieldGroup({
                        id: 'custpage_report_group_criteria_1',
                        label: 'Inicio',
                    }).isBorderHidden = true;

                    // Agregamos campo tipo de reporte asociado al grupo 1
                    let typeReportField = form.addField({
                        id: 'custpage_report_criteria_report',
                        label: 'Tipo de Reporte',
                        type: 'select',
                        container: 'custpage_report_group_criteria_1'
                    });
                    typeReportField.addSelectOption({ value: '', text: '' });
                    for (var key in STATIC_DATA.reports) {
                        typeReportField.addSelectOption({ value: key, text: STATIC_DATA.reports[key] })
                    }
                    typeReportField.isMandatory = true;
                    typeReportField.updateBreakType({ breakType: 'STARTCOL' });

                    if (params.report) { typeReportField.defaultValue = params.report; }

                    // Agregamos grupo2 en el formulario que contendra los filtros del reporte
                    let group2 = form.addFieldGroup({
                        id: 'custpage_report_group_criteria_2',
                        label: 'Filtros',
                    });

                    // Agregamos campo subsidiaria asociado al grupo2
                    let subsidiaryField = form.addField({
                        id: 'custpage_report_criteria_subsidiary',
                        label: 'Subsidiaria',
                        type: 'select',
                        source: 'subsidiary',
                        container: 'custpage_report_group_criteria_2'
                    });
                    subsidiaryField.updateBreakType({ breakType: 'STARTCOL' });
                    subsidiaryField.isMandatory = true;

                    if (params.subsidiary) { subsidiaryField.defaultValue = params.subsidiary; }

                    // Agregamos campo vista asociado a grupo2
                    let viewFormField = form.addField({
                        id: 'custpage_report_criteria_view',
                        label: 'Vista',
                        type: 'select',
                        container: 'custpage_report_group_criteria_2'
                    });
                    for (var key in STATIC_DATA.viewForm) {
                        viewFormField.addSelectOption({ value: key, text: STATIC_DATA.viewForm[key] })
                    }
                    viewFormField.isMandatory = true;
                    viewFormField.updateBreakType({ breakType: 'STARTCOL' });

                    if (params.view) { viewFormField.defaultValue = params.view; }

                    // Agregamos campo Año asociado a grupo2
                    let yearField = form.addField({
                        id: 'custpage_report_criteria_year',
                        label: 'Año',
                        type: 'select',
                        container: 'custpage_report_group_criteria_2'
                    });
                    yearField.updateBreakType({ breakType: 'STARTCOL' });
                    yearField.isMandatory = true;

                    createAccountingPeriodYear().forEach(node => {
                        yearField.addSelectOption({ value: node.id, text: node.text });
                    });

                    if (params.year) { yearField.defaultValue = params.year; }

                    // Agregamos campo Mes asociado a grupo2
                    let monthField = form.addField({
                        id: 'custpage_report_criteria_month',
                        label: 'Mes',
                        type: 'select',
                        container: 'custpage_report_group_criteria_2'
                    });
                    monthField.updateBreakType({ breakType: 'STARTCOL' });

                    if (params.view != 'D') {
                        monthField.updateDisplayType({ displayType: 'DISABLED' })
                    } else {
                        let selectedYear = params.year;
                        if (selectedYear) {
                            createAccountingPeriodByYear(selectedYear).forEach(node => {
                                monthField.addSelectOption({ value: node.id, text: node.text });
                            });
                            if (params.month) {
                                monthField.defaultValue = params.month;
                            }
                        }
                    }
                    //**************************************************

                    //**************************************************
                    // Seleccion del tipo de reporte para enviar como parametro en la pagina
                    let selectedReportHtml = '';

                    switch (Number(params.report)) {
                        case STATIC_DATA.type_report.PL_MERCADO:
                            let templateFormat = file.load('../freemarker/ViewerReportComparativeMain.html').getContents();
                            let renderer = render.create();
                            renderer.templateContent = '<#assign context =data.context?eval/>' + '' + templateFormat;
                            renderer.addCustomDataSource({
                                alias: 'data',
                                format: render.DataSource.OBJECT,
                                data: { context: JSON.stringify({}) }
                            });
                            selectedReportHtml = renderer.renderAsString();
                            //selectedReportHtml = '<h1>Reporte P&L por Mercado</h1>';
                            break;
                        case STATIC_DATA.type_report.PL_LINEA:
                            selectedReportHtml = '<h1>Reporte P&L por Linea Farmacéutica</h1>';
                            break;
                        case STATIC_DATA.type_report.PL_CANTIDADES:
                            selectedReportHtml = '<h1>Reporte P&L por Cantidades (Por Linea y Mercado)</h1>';
                            break;
                        case STATIC_DATA.type_report.PL_CENTROCOSTO:
                            selectedReportHtml = '<h1>Reporte P&L por Centro de Costo Comercial</h1>';
                            break;
                    }
                    //**************************************************
                    
                    //**************************************************
                    // Construyendo el HTML para renderizar en la pagina colocando debajo de los filtros
                    let viewerModelField = form.addField({
                        id: 'custpage_report_viewer_html',
                        label: ' ',
                        type: 'inlinehtml'
                    });
                    viewerModelField.updateLayoutType({ layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW });

                    let htmlContainer = new String();

                    // Ruta del archivo .css
                    let rutaCSS = file.load('../pub/style.css').url;
                    let linkCSS = `<link rel="stylesheet" href="${rutaCSS}">`;

                    htmlContainer = htmlContainer.concat(linkCSS);
                    htmlContainer = htmlContainer.concat(selectedReportHtml);

                    viewerModelField.defaultValue = htmlContainer;

                    form.clientScriptModulePath = './Client.ViewerReportComparativeMain'
                    //**************************************************

                    //**********************************
                    // Escribiendo el html en la pagina
                    scriptContext.response.writePage(form);
                    //**********************************


                } else {

                    //******************************************************
                    // Seleccionamos los parametros y guardamos en una variable para enviar en el formulario
                    let getParams = {};
                    for (var x in SUITELET_RECORD.fields) {
                        let value = params[SUITELET_RECORD.fields[x]];
                        if (value) {
                            getParams[x] = value;
                        }
                    }
                    //******************************************************

                    //******************************************************
                    // Redireccionamos a la misma pagina enviando los parametros seleccionados
                    redirect.toSuitelet({
                        scriptId: runtime.getCurrentScript().id,
                        deploymentId: runtime.getCurrentScript().deploymentId,
                        parameters: getParams
                    });
                    //******************************************************

                }
            } catch (err) {
                log.error('Err', err);
                scriptContext.response.write(JSON.stringify(err));
            }
        }

        return { onRequest }

    });
