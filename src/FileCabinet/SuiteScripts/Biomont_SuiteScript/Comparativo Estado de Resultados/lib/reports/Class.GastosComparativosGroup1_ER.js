/**
 * @NApiVersion 2.1
 */
define(['N', './Class.ReportRenderer_ER', '../Lib.Basic_ER', '../Lib.Operations_ER'],

    function (N, ReportRenderer, Basic, Operations) {

        const REPORTS = {
            1: 'GASTOS_INDIRECTOS',
            2: 'GASTOS_ADM_OP',
            3: 'GASTOS_ADM_OF',
            4: 'GASTOS_VENTAS'
        }

        const { search, log } = N;

        var classes = null;
        var selectReport = null;

        var hasDecimal = 'T';

        function sumAmount(base, amount) {
            return Math.round((Number(base) + Number(amount)) * 100) / 100;
        }

        //function createAccountNumberFilter() {
        //    let filter = ['AND'];
        //    filter.push(['account.number', 'startswith', Basic.Account.True[selectReport]]);

        //    Basic.Account.False[selectReport].forEach(number => {
        //        filter.push('AND');
        //        filter.push(['account.number', 'doesnotstartwith', number]);
        //    });

        //    return filter;
        //}

        function countRecordsWithFilters(filters) {
            // Convertir los filtros a la estructura adecuada para search.create
            var filterExpression = [];
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                if (Array.isArray(filter)) {
                    filterExpression.push(filter);
                } else if (filter === "AND" || filter === "OR") {
                    filterExpression.push(filter);
                }
            }

            // Crear la búsqueda con los filtros convertidos
            var mySearch = search.create({
                type: 'transaction', // Ajusta el tipo según tus necesidades
                filters: filterExpression
            });

            // Ejecutar la búsqueda
            var mySearchObj = mySearch.run();
            var searchResults = mySearchObj.getRange({
                start: 0,
                end: 2 // Ajusta esto según tus necesidades para evitar límites de resultados
            });

            // Obtener la cantidad de registros devueltos
            return searchResults.length;

        }

        function createTransactionDetailsByMonth(periods, subsidiary) {

            let resultTransaction = [];

            let transactionQuery11 = new Basic.CustomSearch('transaction');

            transactionQuery11.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 701]
                //].concat(createAccountNumberFilter())
            ]);

            transactionQuery11.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery11.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery11.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Mercaderias',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery11.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Mercaderias',
                        period: periodId,
                        amount: Number(amount)
                    })
                });
            }

            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery12 = new Basic.CustomSearch('transaction');

            transactionQuery12.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 702],
                "AND",
                ["item.itemid", "contains", "MP00000043"]
            ]);

            transactionQuery12.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery12.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery12.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Materias Primas',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery12.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Materias Primas',
                        period: periodId,
                        amount: Number(amount)
                    })
                });
            }


            periods.forEach(period => {
                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Desvalorizacion Existencias',
                    period: period,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 13, name: 'PARTICIONES TRABAJADORES' },
                    concept: 'PARTICIONES TRABAJADORES',
                    period: period,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 14, name: 'IMPUESTO A LA RENTA' },
                    concept: 'IMPUESTO A LA RENTA',
                    period: period,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 16, name: 'RESERVA LEGAL' },
                    concept: 'RESERVA LEGAL',
                    period: period,
                    amount: 0
                })
            });

            //Siguiente seccion agregada CONCEPTO PT Nacional
            let transactionQuery13 = new Basic.CustomSearch('transaction');

            transactionQuery13.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery13.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery13.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery13.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Nacional',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery13.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 0, name: 'VENTA NACIONAL' },
                            concept: 'PT Nacional',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO PT Exportación
            let transactionQuery14 = new Basic.CustomSearch('transaction');

            transactionQuery14.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery14.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery14.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            if (countRecordsWithFilters(transactionQuery14.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Exportacion',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery14.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 0, name: 'VENTA NACIONAL' },
                            concept: 'PT Exportacion',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada COSTO DE VENTA
            //Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery21 = new Basic.CustomSearch('transaction');

            transactionQuery21.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 696]
            ]);

            transactionQuery21.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery21.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery21.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Mercaderias',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery21.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'Mercaderias',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery22 = new Basic.CustomSearch('transaction');

            transactionQuery22.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 691]
            ]);

            transactionQuery22.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery22.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery22.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Materias Primas',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery22.execute(node => {

                    let periodId = node.getValue('period');
                    let periodName = node.getText('period')
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'Materias Primas',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Venta Nacional
            let transactionQuery23 = new Basic.CustomSearch('transaction');

            transactionQuery23.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 692],
                    "OR",
                    ['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery23.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery23.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            if (countRecordsWithFilters(transactionQuery23.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Nacional',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery23.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'PT Nacional',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Exportación
            let transactionQuery24 = new Basic.CustomSearch('transaction');

            transactionQuery24.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 692],
                    "OR",
                    ['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery24.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery24.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery24.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Exportacion',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery24.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'PT Exportacion',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Desvalorizacion Existencias
            let transactionQuery25 = new Basic.CustomSearch('transaction');

            transactionQuery25.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 695]
            ]);

            transactionQuery25.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery25.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery25.execute(node => {

                let periodId = node.getValue('period');
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Desvalorizacion Existencias',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Objeto para almacenar la "UTILIDAD BRUTA" por periodo y concepto
            const utilidadBrutaData = {};

            // Procesa los datos y calcula la "UTILIDAD BRUTA"
            resultTransaction.forEach(item => {
                if (item.class.id === 0) {
                    const key = `${item.period}_${item.concept}`;
                    if (!utilidadBrutaData[key]) {
                        utilidadBrutaData[key] = {
                            class: { id: 2, name: "UTILIDAD BRUTA" },
                            concept: item.concept,
                            period: item.period,
                            amount: 0
                        };
                    }
                    utilidadBrutaData[key].amount += item.amount;
                } else if (item.class.id === 1) {
                    const key = `${item.period}_${item.concept}`;
                    if (utilidadBrutaData[key]) {
                        utilidadBrutaData[key].amount -= item.amount;
                    }
                }
            });

            // Convierte el objeto en un array de resultados
            const result31 = Object.values(utilidadBrutaData);

            result31.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OPERACIONAL
            let transactionQuery31 = new Basic.CustomSearch('transaction');

            transactionQuery31.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([33, 1, 2, 3, 4, 5, 6, 7]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]]
            ]);

            transactionQuery31.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery31.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery31.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery31.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery31.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery31.execute(node => {

                let className = node.getValue('className');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 3, name: 'GASTO ADMINISTRATIVO OPERACIONAL' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada GASTO ADMINISTRATIVO OFICINA
            let transactionQuery41 = new Basic.CustomSearch('transaction');

            transactionQuery41.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([14, 15, 16, 17, 18, 19, 20]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]]
            ]);

            transactionQuery41.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery41.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery41.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery41.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery41.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery41.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 4, name: 'GASTO ADMINISTRATIVO OFICINA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las sumas acumuladas
            const accum_gasto_administrativo = {};

            // Iterar sobre los elementos de datos
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                // Inicializar la acumulación si es necesario
                if (!accum_gasto_administrativo[classId]) {
                    accum_gasto_administrativo[classId] = {};
                }
                if (!accum_gasto_administrativo[classId][period]) {
                    accum_gasto_administrativo[classId][period] = 0;
                }

                // Acumular el monto
                accum_gasto_administrativo[classId][period] += amount;
            });

            const result51 = [];

            for (const period in accum_gasto_administrativo[3]) {
                const class4Amount = accum_gasto_administrativo[3][period];
                const class5Amount = accum_gasto_administrativo[4] && accum_gasto_administrativo[4][period] ? accum_gasto_administrativo[4][period] : 0;
                const totalAmount = class4Amount + class5Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result51.push({
                    class: { id: 5, name: "GASTO ADMINISTRATIVO" },
                    concept: "GASTO ADMINISTRATIVO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result51.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTO DE VENTA
            let transactionQuery61 = new Basic.CustomSearch('transaction');

            transactionQuery61.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]]
            ]);

            transactionQuery61.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery61.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery61.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery61.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery61.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery61.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 6, name: 'GASTO DE VENTA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_operativa = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_operativa[classId]) {
                    accum_utilidad_operativa[classId] = {};
                }

                if (!accum_utilidad_operativa[classId][period]) {
                    accum_utilidad_operativa[classId][period] = 0;
                }

                accum_utilidad_operativa[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result71 = [];

            for (const period in accum_utilidad_operativa[2]) {
                const class2Amount = accum_utilidad_operativa[2][period];
                const class5Amount = accum_utilidad_operativa[5] && accum_utilidad_operativa[5][period] ? accum_utilidad_operativa[5][period] : 0;
                const class6Amount = accum_utilidad_operativa[6] && accum_utilidad_operativa[6][period] ? accum_utilidad_operativa[6][period] : 0;
                const totalAmount = class2Amount - class5Amount - class6Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result71.push({
                    class: { id: 7, name: "UTILIDAD OPERATIVA" },
                    concept: "UTILIDAD OPERATIVA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result71.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTOS FINANCIEROS
            let transactionQuery81 = new Basic.CustomSearch('transaction');

            transactionQuery81.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 67311111],
                    "OR",
                    ['account.number', 'startswith', 67311112],
                    "OR",
                    ['account.number', 'startswith', 67311113],
                    "OR",
                    ['account.number', 'startswith', 67311115],
                    "OR",
                    ['account.number', 'startswith', 67311114],
                    "OR",
                    ['account.number', 'startswith', 67321111],
                    "OR",
                    ['account.number', 'startswith', 67141111],
                    "OR",
                    ['account.number', 'startswith', 67141112],
                    "OR",
                    ['account.number', 'startswith', 67351111],
                    "OR",
                    ['account.number', 'startswith', 67361111],
                    "OR",
                    ['account.number', 'startswith', 67111111],
                    "OR",
                    ['account.number', 'startswith', 67121111]
                ]
            ]);

            transactionQuery81.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery81.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery81.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 8, name: 'GASTOS FINANCIEROS' },
                        concept: 'GASTOS FINANCIEROS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery81.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 8, name: 'GASTOS FINANCIEROS' },
                            concept: 'GASTOS FINANCIEROS',
                            period: periodId,
                            amount: Number(amount) * -1
                        })
                    }

                });
            }

            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery91 = new Basic.CustomSearch('transaction');

            transactionQuery91.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                [
                    ["account.number", "doesnotstartwith", 75],
                    "AND",
                    ["account.number", "doesnotstartwith", 77211112],
                    "AND",
                    ["account.number", "doesnotstartwith", 77611111]
                ],
                "AND",
                ["accounttype", "anyof", "OthIncome"]
            ]);

            transactionQuery91.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery91.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery91.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery91.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                            concept: 'INGRESOS FINANCIEROS',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }


            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery92 = new Basic.CustomSearch('transaction');

            transactionQuery92.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6477", "6201"]
            ]);

            //transactionQuery81.pushColumn(
            //    { name: 'class', summary: 'GROUP', label: 'classId' }
            //);
            //transactionQuery81.pushColumn(
            //    { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            //);
            transactionQuery92.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery92.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery92.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery92.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery92.execute(node => {

                    let number = node.getValue('number');
                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (number === '67331111') {
                        amount = amount * -1;
                    }

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                            concept: 'INGRESOS FINANCIEROS', //SWAP
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada INGRESOS DIVERSOS
            let transactionQuery101 = new Basic.CustomSearch('transaction');

            transactionQuery101.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 75]
            ]);

            transactionQuery101.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery101.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery101.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 10, name: 'INGRESOS DIVERSOS' },
                        concept: 'INGRESOS DIVERSOS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery101.execute(node => {

                    let periodId = node.getValue('period');
                    let periodName = node.getText('period')
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 10, name: 'INGRESOS DIVERSOS' },
                            concept: 'INGRESOS DIVERSOS',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada DIFERENCIA DE CAMBIO
            let transactionQuery111 = new Basic.CustomSearch('transaction');

            transactionQuery111.updateFilters([
                ["accountingperiod.parent", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6207", "6483"]
            ]);

            transactionQuery111.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery111.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery111.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery111.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 11, name: 'DIFERENCIA DE CAMBIO' },
                        concept: 'DIFERENCIA DE CAMBIO',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery111.execute(node => {

                    let number = node.getValue('number');
                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (number === '67611111') {
                        amount = amount * -1;
                    }

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 11, name: 'DIFERENCIA DE CAMBIO' },
                            concept: 'DIFERENCIA DE CAMBIO',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_antes_particion = {};

            // Iterar sobre los elementos de datos y acumular los valores para class.id 7, 8, 9, 10 y 11
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (classId >= 7 && classId <= 11) {
                    if (!accum_utilidad_antes_particion[classId]) {
                        accum_utilidad_antes_particion[classId] = {};
                    }

                    if (!accum_utilidad_antes_particion[classId][period]) {
                        accum_utilidad_antes_particion[classId][period] = 0;
                    }

                    accum_utilidad_antes_particion[classId][period] += amount;
                }
            });

            // Calcular el resultado acumulado y crear el nuevo objeto JSON
            const result121 = [];

            for (const period in accum_utilidad_antes_particion[7]) {
                const totalAmount = (accum_utilidad_antes_particion[7][period] || 0) +
                    (accum_utilidad_antes_particion[8][period] || 0) +
                    (accum_utilidad_antes_particion[9][period] || 0) +
                    (accum_utilidad_antes_particion[10][period] || 0) +
                    (accum_utilidad_antes_particion[11][period] || 0);

                // Crear el objeto resultante y agregarlo al resultado
                result121.push({
                    class: { id: 12, name: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.' },
                    concept: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.',
                    period: period,
                    amount: totalAmount,
                });
            }

            result121.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });


            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_ejercicio = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_ejercicio[classId]) {
                    accum_utilidad_ejercicio[classId] = {};
                }

                if (!accum_utilidad_ejercicio[classId][period]) {
                    accum_utilidad_ejercicio[classId][period] = 0;
                }

                accum_utilidad_ejercicio[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result151 = [];

            for (const period in accum_utilidad_ejercicio[12]) {
                const class12Amount = accum_utilidad_ejercicio[12][period];
                const class13Amount = accum_utilidad_ejercicio[13] && accum_utilidad_ejercicio[13][period] ? accum_utilidad_ejercicio[13][period] : 0;
                const class14Amount = accum_utilidad_ejercicio[14] && accum_utilidad_ejercicio[14][period] ? accum_utilidad_ejercicio[14][period] : 0;
                const totalAmount = class12Amount - class13Amount - class14Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result151.push({
                    class: { id: 15, name: "UTILIDAD DEL EJERCICIO" },
                    concept: "UTILIDAD DEL EJERCICIO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result151.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_neta = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_neta[classId]) {
                    accum_utilidad_neta[classId] = {};
                }

                if (!accum_utilidad_neta[classId][period]) {
                    accum_utilidad_neta[classId][period] = 0;
                }

                accum_utilidad_neta[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result171 = [];

            for (const period in accum_utilidad_neta[15]) {
                const class15Amount = accum_utilidad_neta[15][period];
                const class16Amount = accum_utilidad_neta[16] && accum_utilidad_neta[16][period] ? accum_utilidad_neta[16][period] : 0;
                const totalAmount = class15Amount + class16Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result171.push({
                    class: { id: 17, name: "UTILIDAD NETA" },
                    concept: "UTILIDAD NETA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result171.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //resultTransaction.sort((a, b) => a.class.id - b.class.id);

            resultTransaction.sort(function (a, b) {
                if (a.class.id !== b.class.id) {
                    return a.class.id - b.class.id;
                }
                return a.concept.localeCompare(b.concept);
            });

            return resultTransaction;
        }

        function createTransactionDetailsByPeriod(periods, subsidiary) {

            log.debug('Periods', periods);

            let resultTransaction = [];

            let transactionQuery11 = new Basic.CustomSearch('transaction');

            transactionQuery11.updateFilters([
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                'AND',
                ['custbody114', 'noneof', '25', '24', '13', '22', '11', '10', '28', '3', '8'],
                'AND',
                ['custcol_ns_afec_igv', 'noneof', '16'],
                'AND',
                ['item.custitem3', 'anyof', '1', '3', '2', '37', '9', '11', '10'],
                'AND',
                ['custbody_ns_document_type', 'anyof', '4', '2', '9', '8'],
                'AND',
                ['account', 'noneof', '6479', '6473', '6469', '6470', '6471', '6472', '6633', '6478']
            ]);

            //transactionQuery.pushColumn(
            //    { name: 'class', summary: 'GROUP', label: 'classId' }
            //);
            // transactionQuery.pushColumn(
            //     { name: 'name', join: 'class', summary: 'GROUP', label: 'className' }
            // );
            //transactionQuery.pushColumn(
            //    { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            //);
            transactionQuery11.pushColumn(
                { name: 'custitem3', join: 'item', summary: 'GROUP', label: 'line' }
            );
            transactionQuery11.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery11.pushColumn(
                { name: 'netamount', summary: 'SUM', label: 'amount' }
            );

            /*if (countRecordsWithFilters(transactionQuery11.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Mercaderias',
                        period: period,
                        amount: 0
                    })
                })
            } else {*/

            transactionQuery11.execute(node => {

                let line = node.getText('line');
                let periodId = node.getValue('period');
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NETA' },
                        concept: line,
                        period: periodId,
                        amount: Number(amount)
                    })
                }
            });
            /*}*/

            /*//Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery12 = new Basic.CustomSearch('transaction');

            transactionQuery12.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 702],
                "AND",
                ["item.itemid", "contains", "MP00000043"]
            ]);

            transactionQuery12.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery12.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery12.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Materias Primas',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery12.execute(node => {

                    let periodId = node.getValue('period');
                    let periodName = node.getText('period')
                    let amount = node.getValue('amount');

                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'Materias Primas',
                        period: periodId,
                        amount: Number(amount)
                    })
                });
            }


            periods.forEach(period => {
                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Desvalorizacion Existencias',
                    period: period,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 13, name: 'PARTICIONES TRABAJADORES' },
                    concept: 'PARTICIONES TRABAJADORES',
                    period: period,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 14, name: 'IMPUESTO A LA RENTA' },
                    concept: 'IMPUESTO A LA RENTA',
                    period: period,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 16, name: 'RESERVA LEGAL' },
                    concept: 'RESERVA LEGAL',
                    period: period,
                    amount: 0
                })
            });

            //Siguiente seccion agregada CONCEPTO PT Nacional
            let transactionQuery13 = new Basic.CustomSearch('transaction');

            transactionQuery13.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery13.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery13.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery13.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Nacional',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery13.execute(node => {

                    let periodId = node.getValue('period');
                    let periodName = node.getText('period')
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 0, name: 'VENTA NACIONAL' },
                            concept: 'PT Nacional',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO PT Exportación
            let transactionQuery14 = new Basic.CustomSearch('transaction');

            transactionQuery14.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery14.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery14.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery14.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Exportacion',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery14.execute(node => {

                    let periodId = node.getValue('period');
                    let periodName = node.getText('period')
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 0, name: 'VENTA NACIONAL' },
                            concept: 'PT Exportacion',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada COSTO DE VENTA
            //Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery21 = new Basic.CustomSearch('transaction');

            transactionQuery21.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 696]
            ]);

            transactionQuery21.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery21.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery21.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Mercaderias',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery21.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'Mercaderias',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery22 = new Basic.CustomSearch('transaction');

            transactionQuery22.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 691]
            ]);

            transactionQuery22.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery22.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            if (countRecordsWithFilters(transactionQuery22.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Materias Primas',
                        period: period,
                        amount: 0
                    })
                })
            } else {
                transactionQuery22.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'Materias Primas',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Venta Nacional
            let transactionQuery23 = new Basic.CustomSearch('transaction');

            transactionQuery23.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 692],
                    "OR",
                    ['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery23.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery23.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery23.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Nacional',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery23.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'PT Nacional',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Exportación
            let transactionQuery24 = new Basic.CustomSearch('transaction');

            transactionQuery24.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 692]
                    //"OR",
                    //['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery24.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery24.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery24.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Exportacion',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery24.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'PT Exportacion',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada CONCEPTO Desvalorizacion Existencias
            let transactionQuery25 = new Basic.CustomSearch('transaction');

            transactionQuery25.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 695]
            ]);

            transactionQuery25.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery25.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery25.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Desvalorizacion Existencias',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery25.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 1, name: 'COSTO DE VENTAS' },
                            concept: 'Desvalorizacion Existencias',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            // Objeto para almacenar la "UTILIDAD BRUTA" por periodo y concepto
            const utilidadBrutaData = {};

            // Procesa los datos y calcula la "UTILIDAD BRUTA"
            resultTransaction.forEach(item => {
                if (item.class.id === 0) {
                    const key = `${item.period}_${item.concept}`;
                    if (!utilidadBrutaData[key]) {
                        utilidadBrutaData[key] = {
                            class: { id: 2, name: "UTILIDAD BRUTA" },
                            concept: item.concept,
                            period: item.period,
                            amount: 0
                        };
                    }
                    utilidadBrutaData[key].amount += item.amount;
                } else if (item.class.id === 1) {
                    const key = `${item.period}_${item.concept}`;
                    if (utilidadBrutaData[key]) {
                        utilidadBrutaData[key].amount -= item.amount;
                    }
                }
            });

            // Convierte el objeto en un array de resultados
            const result31 = Object.values(utilidadBrutaData);

            result31.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OPERACIONAL
            let transactionQuery31 = new Basic.CustomSearch('transaction');

            transactionQuery31.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([33, 1, 2, 3, 4, 5, 6, 7]),
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]],
                "AND",
                ["memorized", "is", "F"]
            ]);

            //transactionQuery31.pushColumn(
            //    { name: 'class', summary: 'GROUP', label: 'classId' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'amount', summary: 'SUM', label: 'amount' }
            //;

            transactionQuery31.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery31.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery31.pushColumn(
                { name: 'internalid', join: 'accountingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery31.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery31.execute(node => {
                //let className = node.getValue('className');
                //let periodId = node.getValue('period');
                //let amount = node.getValue('amount');

                let classId = node.getValue('classId');
                let className = node.getText('classId').split(':');
                className = className[className.length - 1];
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let amount = Number(node.getValue('amount'));


                if (periodId) {
                    resultTransaction.push({
                        class: { id: 3, name: 'GASTO ADMINISTRATIVO OPERACIONAL' },
                        concept: className,
                        period: periodId,
                        amount: amount
                    })
                }

            });


            //Siguiente seccion agregada GASTO ADMINISTRATIVO OFICINA
            let transactionQuery41 = new Basic.CustomSearch('transaction');

            transactionQuery41.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([14, 15, 16, 17, 18, 19, 20]),
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]],
                "AND",
                ["memorized", "is", "F"]
            ]);

            transactionQuery41.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery41.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            //transactionQuery41.pushColumn(
            //    { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            //);
            transactionQuery41.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery41.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery41.execute(node => {

                let className = node.getValue('className');
                let periodId = node.getValue('period');
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 4, name: 'GASTO ADMINISTRATIVO OFICINA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //log.debug("periods", periods)

            const accum_gasto_administrativo = {};
            for (const item of resultTransaction) {
                const id = item.class.id;
                if (id === 3 || id === 4) {
                    const period = item.period;
                    if (!accum_gasto_administrativo[period]) {
                        accum_gasto_administrativo[period] = {
                            class: { id: 5, name: "GASTO ADMINISTRATIVO" },
                            concept: "GASTO ADMINISTRATIVO",
                            period: period,
                            amount: 0
                        };
                    }
                    accum_gasto_administrativo[period].amount += parseFloat(item.amount);
                }
            }

            // Convert the result object to an array
            const result51 = Object.values(accum_gasto_administrativo);

            result51.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });



            //Siguiente seccion agregada GASTO DE VENTA
            let transactionQuery61 = new Basic.CustomSearch('transaction');

            transactionQuery61.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]]
            ]);

            transactionQuery61.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery61.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery61.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery61.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery61.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery61.execute(node => {

                let className = node.getValue('className');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 6, name: 'GASTO DE VENTA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_operativa = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_operativa[classId]) {
                    accum_utilidad_operativa[classId] = {};
                }

                if (!accum_utilidad_operativa[classId][period]) {
                    accum_utilidad_operativa[classId][period] = 0;
                }

                accum_utilidad_operativa[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result71 = [];

            for (const period in accum_utilidad_operativa[2]) {
                const class2Amount = accum_utilidad_operativa[2][period];
                const class5Amount = accum_utilidad_operativa[5] && accum_utilidad_operativa[5][period] ? accum_utilidad_operativa[5][period] : 0;
                const class6Amount = accum_utilidad_operativa[6] && accum_utilidad_operativa[6][period] ? accum_utilidad_operativa[6][period] : 0;
                const totalAmount = class2Amount - class5Amount - class6Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result71.push({
                    class: { id: 7, name: "UTILIDAD OPERATIVA" },
                    concept: "UTILIDAD OPERATIVA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result71.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTOS FINANCIEROS
            let transactionQuery81 = new Basic.CustomSearch('transaction');

            transactionQuery81.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                [
                    ['account.number', 'startswith', 67311111],
                    "OR",
                    ['account.number', 'startswith', 67311112],
                    "OR",
                    ['account.number', 'startswith', 67311113],
                    "OR",
                    ['account.number', 'startswith', 67311115],
                    "OR",
                    ['account.number', 'startswith', 67311114],
                    "OR",
                    ['account.number', 'startswith', 67321111],
                    "OR",
                    ['account.number', 'startswith', 67141111],
                    "OR",
                    ['account.number', 'startswith', 67141112],
                    "OR",
                    ['account.number', 'startswith', 67351111],
                    "OR",
                    ['account.number', 'startswith', 67361111],
                    "OR",
                    ['account.number', 'startswith', 67111111],
                    "OR",
                    ['account.number', 'startswith', 67121111]
                ]
            ]);

            transactionQuery81.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery81.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery81.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 8, name: 'GASTOS FINANCIEROS' },
                        concept: 'GASTOS FINANCIEROS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery81.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 8, name: 'GASTOS FINANCIEROS' },
                            concept: 'GASTOS FINANCIEROS',
                            period: periodId,
                            amount: Number(amount) * -1
                        })
                    }

                });
            }

            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery91 = new Basic.CustomSearch('transaction');

            transactionQuery91.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                [
                    ["account.number", "doesnotstartwith", 75],
                    "AND",
                    ["account.number", "doesnotstartwith", 77211112],
                    "AND",
                    ["account.number", "doesnotstartwith", 77611111]
                ],
                "AND",
                ["accounttype", "anyof", "OthIncome"]
            ]);

            transactionQuery91.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery91.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery91.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery91.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                            concept: 'INGRESOS FINANCIEROS',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }


            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery92 = new Basic.CustomSearch('transaction');

            transactionQuery92.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6477", "6201"]
            ]);

            transactionQuery92.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery92.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery92.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery92.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery92.execute(node => {

                    let number = node.getValue('number');
                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (number === '67331111') {
                        amount = amount * -1;
                    }

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                            concept: 'INGRESOS FINANCIEROS', //SWAP
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });

            }

            //Siguiente seccion agregada INGRESOS DIVERSOS
            let transactionQuery101 = new Basic.CustomSearch('transaction');

            transactionQuery101.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 75]
            ]);

            transactionQuery101.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery101.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery101.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 10, name: 'INGRESOS DIVERSOS' },
                        concept: 'INGRESOS DIVERSOS',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery101.execute(node => {

                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 10, name: 'INGRESOS DIVERSOS' },
                            concept: 'INGRESOS DIVERSOS',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            //Siguiente seccion agregada DIFERENCIA DE CAMBIO
            let transactionQuery111 = new Basic.CustomSearch('transaction');

            transactionQuery111.updateFilters([
                ["accountingperiod.parent", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6207", "6483"]
            ]);

            transactionQuery111.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery111.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery111.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            if (countRecordsWithFilters(transactionQuery111.context.filters) === 0) {
                periods.forEach(period => {
                    resultTransaction.push({
                        class: { id: 11, name: 'DIFERENCIA DE CAMBIO' },
                        concept: 'DIFERENCIA DE CAMBIO',
                        period: period,
                        amount: 0
                    })
                })
            } else {

                transactionQuery111.execute(node => {

                    let number = node.getValue('number');
                    let periodId = node.getValue('period');
                    let amount = node.getValue('amount');

                    if (number === '67611111') {
                        amount = amount * -1;
                    }

                    if (periodId) {
                        resultTransaction.push({
                            class: { id: 11, name: 'DIFERENCIA DE CAMBIO' },
                            concept: 'DIFERENCIA DE CAMBIO',
                            period: periodId,
                            amount: Number(amount)
                        })
                    }

                });
            }

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_antes_particion = {};

            // Iterar sobre los elementos de datos y acumular los valores para class.id 7, 8, 9, 10 y 11
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (classId >= 7 && classId <= 11) {
                    if (!accum_utilidad_antes_particion[classId]) {
                        accum_utilidad_antes_particion[classId] = {};
                    }

                    if (!accum_utilidad_antes_particion[classId][period]) {
                        accum_utilidad_antes_particion[classId][period] = 0;
                    }

                    accum_utilidad_antes_particion[classId][period] += amount;
                }
            });

            // Calcular el resultado acumulado y crear el nuevo objeto JSON
            const result121 = [];

            for (const period in accum_utilidad_antes_particion[7]) {
                const totalAmount = (accum_utilidad_antes_particion[7][period] || 0) +
                    (accum_utilidad_antes_particion[8][period] || 0) +
                    (accum_utilidad_antes_particion[9][period] || 0) +
                    (accum_utilidad_antes_particion[10][period] || 0) +
                    (accum_utilidad_antes_particion[11][period] || 0);

                // Crear el objeto resultante y agregarlo al resultado
                result121.push({
                    class: { id: 12, name: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.' },
                    concept: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.',
                    period: period,
                    amount: totalAmount,
                });
            }

            result121.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });


            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_ejercicio = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_ejercicio[classId]) {
                    accum_utilidad_ejercicio[classId] = {};
                }

                if (!accum_utilidad_ejercicio[classId][period]) {
                    accum_utilidad_ejercicio[classId][period] = 0;
                }

                accum_utilidad_ejercicio[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result151 = [];

            for (const period in accum_utilidad_ejercicio[12]) {
                const class12Amount = accum_utilidad_ejercicio[12][period];
                const class13Amount = accum_utilidad_ejercicio[13] && accum_utilidad_ejercicio[13][period] ? accum_utilidad_ejercicio[13][period] : 0;
                const class14Amount = accum_utilidad_ejercicio[14] && accum_utilidad_ejercicio[14][period] ? accum_utilidad_ejercicio[14][period] : 0;
                const totalAmount = class12Amount - class13Amount - class14Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result151.push({
                    class: { id: 15, name: "UTILIDAD DEL EJERCICIO" },
                    concept: "UTILIDAD DEL EJERCICIO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result151.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_neta = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_neta[classId]) {
                    accum_utilidad_neta[classId] = {};
                }

                if (!accum_utilidad_neta[classId][period]) {
                    accum_utilidad_neta[classId][period] = 0;
                }

                accum_utilidad_neta[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result171 = [];

            for (const period in accum_utilidad_neta[15]) {
                const class15Amount = accum_utilidad_neta[15][period];
                const class16Amount = accum_utilidad_neta[16] && accum_utilidad_neta[16][period] ? accum_utilidad_neta[16][period] : 0;
                const totalAmount = class15Amount + class16Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result171.push({
                    class: { id: 17, name: "UTILIDAD NETA" },
                    concept: "UTILIDAD NETA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result171.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //resultTransaction.sort((a, b) => a.class.id - b.class.id);*/

            log.debug("resultTransaction", resultTransaction);

            resultTransaction.sort(function (a, b) {
                if (a.class.id !== b.class.id) {
                    return a.class.id - b.class.id;
                }
                return a.concept.localeCompare(b.concept);
            });


            //log.debug('Length', resultTransaction.length);

            return resultTransaction;
        }

        function createTransactionDetailsByQuarter(quarters, subsidiary) {
            let resultTransaction = [];

            let transactionQuery11 = new Basic.CustomSearch('transaction');

            transactionQuery11.updateFilters([
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['account.number', 'startswith', 701]
            ]);

            transactionQuery11.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery11.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery11.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period');
                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Mercaderias',
                    period: periodId,
                    amount: Number(amount)
                });
                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Materias Primas',
                    period: periodId,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Desvalorizacion Existencias',
                    period: periodId,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 13, name: 'PARTICIONES TRABAJADORES' },
                    concept: 'PARTICIONES TRABAJADORES',
                    period: periodId,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 14, name: 'IMPUESTO A LA RENTA' },
                    concept: 'IMPUESTO A LA RENTA',
                    period: periodId,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 16, name: 'RESERVA LEGAL' },
                    concept: 'RESERVA LEGAL',
                    period: periodId,
                    amount: 0
                })
            })

            const arrayPeriodos = ['180', '295', '293', '184', '294'];

            //Siguiente seccion agregada CONCEPTO PT Nacional
            let transactionQuery13 = new Basic.CustomSearch('transaction');

            transactionQuery13.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery13.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery13.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery13.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Nacional',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada CONCEPTO PT Exportación
            let transactionQuery14 = new Basic.CustomSearch('transaction');

            transactionQuery14.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery14.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery14.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery14.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Exportacion',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada COSTO DE VENTA
            //Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery21 = new Basic.CustomSearch('transaction');

            transactionQuery21.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 696]
            ]);

            transactionQuery21.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery21.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery21.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Mercaderias',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery22 = new Basic.CustomSearch('transaction');

            transactionQuery22.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 691]
            ]);

            transactionQuery22.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery22.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery22.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Materias Primas',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada CONCEPTO Venta Nacional
            let transactionQuery23 = new Basic.CustomSearch('transaction');

            transactionQuery23.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 692],
                    "OR",
                    ['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery23.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery23.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery23.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Nacional',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada CONCEPTO Exportación
            let transactionQuery24 = new Basic.CustomSearch('transaction');

            transactionQuery24.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 692]
                    //"OR",
                    //['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery24.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery24.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery24.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Exportacion',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada CONCEPTO Desvalorizacion Existencias
            let transactionQuery25 = new Basic.CustomSearch('transaction');

            transactionQuery25.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 695]
            ]);

            transactionQuery25.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery25.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery25.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Desvalorizacion Existencias',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            // Paso 1: Obtener todos los period sin duplicados
            const periods = [...new Set(resultTransaction.map(item => item.period))];

            // Paso 2: Sumar acumulativamente los amount agrupando por class.id y concept
            const conceptPeriodMap = {};

            for (const period of periods) {
                for (const classId of [0, 1]) {
                    for (const concept of ['Mercaderias', 'Materias Primas', 'Desvalorizacion Existencias', 'PT Nacional', 'PT Exportacion']) {
                        const filteredData = resultTransaction.filter(item => item.period === period && item['class'].id === classId && item.concept === concept);
                        const totalAmount = filteredData.reduce((acc, item) => acc + item.amount, 0);
                        conceptPeriodMap[`${classId}-${concept}-${period}`] = totalAmount;
                    }
                }
            }

            // Paso 3: Calcular la diferencia entre class.id 0 y class.id 1
            const result31 = [];
            for (const period of periods) {
                for (const concept of ['Mercaderias', 'Materias Primas', 'Desvalorizacion Existencias', 'PT Nacional', 'PT Exportacion']) {
                    const class0Amount = conceptPeriodMap[`0-${concept}-${period}`] || 0;
                    const class1Amount = conceptPeriodMap[`1-${concept}-${period}`] || 0;
                    const utilidadBruta = class0Amount - class1Amount;
                    result31.push({
                        class: { id: 2, name: "UTILIDAD BRUTA" },
                        concept: concept,
                        period: period,
                        amount: utilidadBruta
                    });
                }
            }

            result31.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });


            // Imprime el resultado como JSON
            //log.debug("resultTransaction",JSON.stringify(resultTransaction));

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OPERACIONAL
            let transactionQuery31 = new Basic.CustomSearch('transaction');

            transactionQuery31.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([33, 1, 2, 3, 4, 5, 6, 7]),
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]],
                "AND",
                ["memorized", "is", "F"]
            ]);

            transactionQuery31.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery31.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery31.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery31.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery31.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery31.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 3, name: 'GASTO ADMINISTRATIVO OPERACIONAL' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OFICINA
            let transactionQuery41 = new Basic.CustomSearch('transaction');

            transactionQuery41.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([14, 15, 16, 17, 18, 19, 20]),
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]],
                "AND",
                ["memorized", "is", "F"]
            ]);

            transactionQuery41.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery41.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery41.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery41.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery41.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery41.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 4, name: 'GASTO ADMINISTRATIVO OFICINA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las sumas acumuladas
            const accum_gasto_administrativo = {};

            // Iterar sobre los elementos de datos
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                // Inicializar la acumulación si es necesario
                if (!accum_gasto_administrativo[classId]) {
                    accum_gasto_administrativo[classId] = {};
                }
                if (!accum_gasto_administrativo[classId][period]) {
                    accum_gasto_administrativo[classId][period] = 0;
                }

                // Acumular el monto
                accum_gasto_administrativo[classId][period] += amount;
            });

            const result51 = [];

            for (const period in accum_gasto_administrativo[3]) {
                const class4Amount = accum_gasto_administrativo[3][period];
                const class5Amount = accum_gasto_administrativo[4] && accum_gasto_administrativo[4][period] ? accum_gasto_administrativo[4][period] : 0;
                const totalAmount = class4Amount + class5Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result51.push({
                    class: { id: 5, name: "GASTO ADMINISTRATIVO" },
                    concept: "GASTO ADMINISTRATIVO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result51.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTO DE VENTA
            let transactionQuery61 = new Basic.CustomSearch('transaction');

            transactionQuery61.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]]
            ]);

            transactionQuery61.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery61.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery61.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery61.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery61.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery61.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 6, name: 'GASTO DE VENTA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_operativa = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_operativa[classId]) {
                    accum_utilidad_operativa[classId] = {};
                }

                if (!accum_utilidad_operativa[classId][period]) {
                    accum_utilidad_operativa[classId][period] = 0;
                }

                accum_utilidad_operativa[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result71 = [];

            for (const period in accum_utilidad_operativa[2]) {
                const class2Amount = accum_utilidad_operativa[2][period];
                const class5Amount = accum_utilidad_operativa[5] && accum_utilidad_operativa[5][period] ? accum_utilidad_operativa[5][period] : 0;
                const class6Amount = accum_utilidad_operativa[6] && accum_utilidad_operativa[6][period] ? accum_utilidad_operativa[6][period] : 0;
                const totalAmount = class2Amount - class5Amount - class6Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result71.push({
                    class: { id: 7, name: "UTILIDAD OPERATIVA" },
                    concept: "UTILIDAD OPERATIVA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result71.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTOS FINANCIEROS
            let transactionQuery81 = new Basic.CustomSearch('transaction');

            transactionQuery81.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                //"AND",
                //['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                //"AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"],
                "AND",
                [
                    ['account.number', 'startswith', 67311111],
                    "OR",
                    ['account.number', 'startswith', 67311112],
                    "OR",
                    ['account.number', 'startswith', 67311113],
                    "OR",
                    ['account.number', 'startswith', 67311115],
                    "OR",
                    ['account.number', 'startswith', 67311114],
                    "OR",
                    ['account.number', 'startswith', 67321111],
                    "OR",
                    ['account.number', 'startswith', 67141111],
                    "OR",
                    ['account.number', 'startswith', 67141112],
                    "OR",
                    ['account.number', 'startswith', 67351111],
                    "OR",
                    ['account.number', 'startswith', 67361111],
                    "OR",
                    ['account.number', 'startswith', 67111111],
                    "OR",
                    ['account.number', 'startswith', 67121111]
                ]
            ]);

            transactionQuery81.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery81.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery81.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 8, name: 'GASTOS FINANCIEROS' },
                        concept: 'GASTOS FINANCIEROS',
                        period: periodId,
                        amount: Number(amount) * -1
                    })
                }

            });


            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery91 = new Basic.CustomSearch('transaction');

            transactionQuery91.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                [
                    ["account.number", "doesnotstartwith", 75],
                    "AND",
                    ["account.number", "doesnotstartwith", 77211112],
                    "AND",
                    ["account.number", "doesnotstartwith", 77611111]
                ],
                "AND",
                ["accounttype", "anyof", "OthIncome"]
            ]);

            transactionQuery91.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery91.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery91.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });



            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery92 = new Basic.CustomSearch('transaction');

            transactionQuery92.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6477", "6201"]
            ]);

            //transactionQuery81.pushColumn(
            //    { name: 'class', summary: 'GROUP', label: 'classId' }
            //);
            //transactionQuery81.pushColumn(
            //    { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            //);
            transactionQuery92.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery92.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery92.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery92.execute(node => {

                let number = node.getValue('number');

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (number === '67331111') {
                    amount = amount * -1;
                }

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS', //SWAP
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada INGRESOS DIVERSOS
            let transactionQuery101 = new Basic.CustomSearch('transaction');

            transactionQuery101.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                //"AND",
                //['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                //"AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"],
                //"AND",
                //["account.number","doesnotstartwith",[75,77211112,77611111]], //[75,77211112,77611111]
                //"AND", 
                //["accounttype","anyof","OthIncome"],
                "AND",
                ['account.number', 'startswith', 75]
            ]);

            transactionQuery101.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery101.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery101.execute(node => {

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 10, name: 'INGRESOS DIVERSOS' },
                        concept: 'INGRESOS DIVERSOS',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada DIFERENCIA DE CAMBIO
            let transactionQuery111 = new Basic.CustomSearch('transaction');

            transactionQuery111.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6207", "6483"]
            ]);

            transactionQuery111.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery111.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery111.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery111.execute(node => {

                let number = node.getValue('number');

                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                if (number === '67611111') {
                    amount = amount * -1;
                }

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 11, name: 'DIFERENCIA DE CAMBIO' },
                        concept: 'DIFERENCIA DE CAMBIO',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_antes_particion = {};

            // Iterar sobre los elementos de datos y acumular los valores para class.id 7, 8, 9, 10 y 11
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (classId >= 7 && classId <= 11) {
                    if (!accum_utilidad_antes_particion[classId]) {
                        accum_utilidad_antes_particion[classId] = {};
                    }

                    if (!accum_utilidad_antes_particion[classId][period]) {
                        accum_utilidad_antes_particion[classId][period] = 0;
                    }

                    accum_utilidad_antes_particion[classId][period] += amount;
                }
            });

            // Calcular el resultado acumulado y crear el nuevo objeto JSON
            const result121 = [];

            for (const period in accum_utilidad_antes_particion[7]) {
                const totalAmount = (accum_utilidad_antes_particion[7][period] || 0) +
                    (accum_utilidad_antes_particion[8][period] || 0) +
                    (accum_utilidad_antes_particion[9][period] || 0) +
                    (accum_utilidad_antes_particion[10][period] || 0) +
                    (accum_utilidad_antes_particion[11][period] || 0);

                // Crear el objeto resultante y agregarlo al resultado
                result121.push({
                    class: { id: 12, name: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.' },
                    concept: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.',
                    period: period,
                    amount: totalAmount,
                });
            }

            result121.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });


            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_ejercicio = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_ejercicio[classId]) {
                    accum_utilidad_ejercicio[classId] = {};
                }

                if (!accum_utilidad_ejercicio[classId][period]) {
                    accum_utilidad_ejercicio[classId][period] = 0;
                }

                accum_utilidad_ejercicio[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result151 = [];

            for (const period in accum_utilidad_ejercicio[12]) {
                const class12Amount = accum_utilidad_ejercicio[12][period];
                const class13Amount = accum_utilidad_ejercicio[13] && accum_utilidad_ejercicio[13][period] ? accum_utilidad_ejercicio[13][period] : 0;
                const class14Amount = accum_utilidad_ejercicio[14] && accum_utilidad_ejercicio[14][period] ? accum_utilidad_ejercicio[14][period] : 0;
                const totalAmount = class12Amount - class13Amount - class14Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result151.push({
                    class: { id: 15, name: "UTILIDAD DEL EJERCICIO" },
                    concept: "UTILIDAD DEL EJERCICIO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result151.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_neta = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_neta[classId]) {
                    accum_utilidad_neta[classId] = {};
                }

                if (!accum_utilidad_neta[classId][period]) {
                    accum_utilidad_neta[classId][period] = 0;
                }

                accum_utilidad_neta[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result171 = [];

            for (const period in accum_utilidad_neta[15]) {
                const class15Amount = accum_utilidad_neta[15][period];
                const class16Amount = accum_utilidad_neta[16] && accum_utilidad_neta[16][period] ? accum_utilidad_neta[16][period] : 0;
                const totalAmount = class15Amount + class16Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result171.push({
                    class: { id: 17, name: "UTILIDAD NETA" },
                    concept: "UTILIDAD NETA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result171.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //resultTransaction.sort((a, b) => a.class.id - b.class.id);

            resultTransaction.sort(function (a, b) {
                if (a.class.id !== b.class.id) {
                    return a.class.id - b.class.id;
                }
                return a.concept.localeCompare(b.concept);
            });

            return resultTransaction;
        }

        function createTransactionsDetailsByYear(years, subsidiary) {

            let quarterYearMap = {}

            search.create({
                type: "accountingperiod",
                filters:
                    [
                        ['parent', 'anyof'].concat(years),
                        "AND",
                        ["isquarter", "is", "T"]
                    ],
                columns:
                    [
                        'internalid', 'parent'
                    ]
            }).run().each(node => {
                quarterYearMap[node.id] = node.getValue('parent');
                return true;
            });


            let resultTransaction = [];

            // Siguiente seccion agregada VENTA NACIONAL
            // Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery11 = new Basic.CustomSearch('transaction');

            transactionQuery11.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 702]
            ]);

            // transactionQuery.pushColumn(
            //     { name: 'class', summary: 'GROUP', label: 'classId' }
            // );
            // transactionQuery.pushColumn(
            //     { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            // );
            // transactionQuery.pushColumn(
            //     { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            // );
            transactionQuery11.pushColumn(
                { name: 'custitem3', join: "item", summary: 'GROUP', label: 'line' }
            );
            transactionQuery11.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery11.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery11.execute(node => {

                let line = node.getText('line');
                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NETAS' },
                        concept: line,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            /*//Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery12 = new Basic.CustomSearch('transaction');

            transactionQuery12.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 702],
                "AND",
                ["item.itemid", "contains", "MP00000043"]
            ]);

            transactionQuery12.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery12.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            years.forEach(year => {
                resultTransaction.push({ //CASO INUSUAL
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Materias Primas',
                    period: year,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Desvalorizacion Existencias',
                    period: year,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 13, name: 'PARTICIONES TRABAJADORES' },
                    concept: 'PARTICIONES TRABAJADORES',
                    period: year,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 14, name: 'IMPUESTO A LA RENTA' },
                    concept: 'IMPUESTO A LA RENTA',
                    period: year,
                    amount: 0
                })
                resultTransaction.push({
                    class: { id: 16, name: 'RESERVA LEGAL' },
                    concept: 'RESERVA LEGAL',
                    period: year,
                    amount: 0
                })
            })


            //Siguiente seccion agregada CONCEPTO PT Nacional
            let transactionQuery13 = new Basic.CustomSearch('transaction');

            transactionQuery13.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery13.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery13.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery13.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                //if (!periodId) {
                //    periodId = '171';
                //}

                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Nacional',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada CONCEPTO PT Exportación
            let transactionQuery14 = new Basic.CustomSearch('transaction');

            transactionQuery14.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 702],
                    "OR",
                    ['account.number', 'startswith', 7411]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery14.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery14.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery14.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                //if (!periodId) {
                //    periodId = '291';
                //}

                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 0, name: 'VENTA NACIONAL' },
                        concept: 'PT Exportacion',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada COSTO DE VENTA
            //Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery21 = new Basic.CustomSearch('transaction');

            transactionQuery21.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 696]
            ]);

            transactionQuery21.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery21.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery21.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Mercaderias',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery22 = new Basic.CustomSearch('transaction');

            transactionQuery22.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 691]
            ]);

            transactionQuery22.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery22.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery22.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Materias Primas',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada CONCEPTO Venta Nacional
            let transactionQuery23 = new Basic.CustomSearch('transaction');

            transactionQuery23.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 692],
                    "OR",
                    ['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'isnot', 'EXPORTACION']
            ]);

            transactionQuery23.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery23.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery23.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Nacional',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada CONCEPTO Exportación
            let transactionQuery24 = new Basic.CustomSearch('transaction');

            transactionQuery24.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                [
                    ['account.number', 'startswith', 692],
                    "OR",
                    ['account.number', 'startswith', 699]
                ],
                "AND",
                //['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
                ['customer.custentity_customer_report_p_and_l', 'is', 'EXPORTACION']
            ]);

            transactionQuery24.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery24.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery24.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '291';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'PT Exportacion',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada CONCEPTO Desvalorizacion Existencias
            let transactionQuery25 = new Basic.CustomSearch('transaction');

            transactionQuery25.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type", "noneof", "Estimate", "SalesOrd", "Opprtnty"],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                //['class', 'anyof'].concat(classes)
                //'AND',
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"]
                ['account.number', 'startswith', 695]
            ]);

            transactionQuery25.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery25.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery25.execute(node => {

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 1, name: 'COSTO DE VENTAS' },
                        concept: 'Desvalorizacion Existencias',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Objeto para almacenar la "UTILIDAD BRUTA" por periodo y concepto
            const utilidadBrutaData = {};

            // Procesa los datos y calcula la "UTILIDAD BRUTA"
            resultTransaction.forEach(item => {
                if (item.class.id === 0) {
                    const key = `${item.period}_${item.concept}`;
                    if (!utilidadBrutaData[key]) {
                        utilidadBrutaData[key] = {
                            class: { id: 2, name: "UTILIDAD BRUTA" },
                            concept: item.concept,
                            period: item.period,
                            amount: 0
                        };
                    }
                    utilidadBrutaData[key].amount += item.amount;
                } else if (item.class.id === 1) {
                    const key = `${item.period}_${item.concept}`;
                    if (utilidadBrutaData[key]) {
                        utilidadBrutaData[key].amount -= item.amount;
                    }
                }
            });

            // Convierte el objeto en un array de resultados
            const result31 = Object.values(utilidadBrutaData);

            result31.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            // Imprime el resultado como JSON
            //log.debug("resultTransaction",JSON.stringify(resultTransaction));

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OPERACIONAL
            let transactionQuery31 = new Basic.CustomSearch('transaction');

            transactionQuery31.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([33, 1, 2, 3, 4, 5, 6, 7]),
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]],
                "AND",
                ["memorized", "is", "F"]
            ]);

            //transactionQuery31.pushColumn(
            //    { name: 'class', summary: 'GROUP', label: 'classId' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            //);
            //transactionQuery31.pushColumn(
            //    { name: 'amount', summary: 'SUM', label: 'amount' }
            //);

            transactionQuery31.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery31.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery31.pushColumn(
                { name: 'internalid', join: 'accountingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery31.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery31.execute(node => {

                let classId = node.getValue('classId');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];
                let amount = Number(node.getValue('amount'));

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 3, name: 'GASTO ADMINISTRATIVO OPERACIONAL' },
                        concept: className,
                        period: periodId,
                        amount: hasDecimal == 'T' ? Number(amount) : Number(amount.toFixed(0))
                    })
                }

            });

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OFICINA
            let transactionQuery41 = new Basic.CustomSearch('transaction');

            transactionQuery41.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([14, 15, 16, 17, 18, 19, 20]),
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]],
                "AND",
                ["memorized", "is", "F"]
            ]);

            transactionQuery41.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery41.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery41.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery41.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery41.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery41.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 4, name: 'GASTO ADMINISTRATIVO OFICINA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las sumas acumuladas
            const accum_gasto_administrativo = {};

            // Iterar sobre los elementos de datos
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                // Inicializar la acumulación si es necesario
                if (!accum_gasto_administrativo[classId]) {
                    accum_gasto_administrativo[classId] = {};
                }
                if (!accum_gasto_administrativo[classId][period]) {
                    accum_gasto_administrativo[classId][period] = 0;
                }

                // Acumular el monto
                accum_gasto_administrativo[classId][period] += amount;
            });

            const result51 = [];

            for (const period in accum_gasto_administrativo[3]) {
                const class4Amount = accum_gasto_administrativo[3][period];
                const class5Amount = accum_gasto_administrativo[4] && accum_gasto_administrativo[4][period] ? accum_gasto_administrativo[4][period] : 0;
                const totalAmount = class4Amount + class5Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result51.push({
                    class: { id: 5, name: "GASTO ADMINISTRATIVO" },
                    concept: "GASTO ADMINISTRATIVO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result51.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTO DE VENTA
            let transactionQuery61 = new Basic.CustomSearch('transaction');

            transactionQuery61.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number", "doesnotstartwith", [60, 61, 67, 69]]
            ]);

            transactionQuery61.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery61.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery61.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery61.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery61.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery61.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');


                if (periodId) {
                    resultTransaction.push({
                        class: { id: 6, name: 'GASTO DE VENTA' },
                        concept: className,
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_operativa = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_operativa[classId]) {
                    accum_utilidad_operativa[classId] = {};
                }

                if (!accum_utilidad_operativa[classId][period]) {
                    accum_utilidad_operativa[classId][period] = 0;
                }

                accum_utilidad_operativa[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result71 = [];

            for (const period in accum_utilidad_operativa[2]) {
                const class2Amount = accum_utilidad_operativa[2][period];
                const class5Amount = accum_utilidad_operativa[5] && accum_utilidad_operativa[5][period] ? accum_utilidad_operativa[5][period] : 0;
                const class6Amount = accum_utilidad_operativa[6] && accum_utilidad_operativa[6][period] ? accum_utilidad_operativa[6][period] : 0;
                const totalAmount = class2Amount - class5Amount - class6Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result71.push({
                    class: { id: 7, name: "UTILIDAD OPERATIVA" },
                    concept: "UTILIDAD OPERATIVA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result71.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            //Siguiente seccion agregada GASTOS FINANCIEROS
            let transactionQuery81 = new Basic.CustomSearch('transaction');

            transactionQuery81.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                //"AND",
                //['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                //"AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"],
                "AND",
                [
                    ['account.number', 'startswith', 67311111],
                    "OR",
                    ['account.number', 'startswith', 67311112],
                    "OR",
                    ['account.number', 'startswith', 67311113],
                    "OR",
                    ['account.number', 'startswith', 67311115],
                    "OR",
                    ['account.number', 'startswith', 67311114],
                    "OR",
                    ['account.number', 'startswith', 67321111],
                    "OR",
                    ['account.number', 'startswith', 67141111],
                    "OR",
                    ['account.number', 'startswith', 67141112],
                    "OR",
                    ['account.number', 'startswith', 67351111],
                    "OR",
                    ['account.number', 'startswith', 67361111],
                    "OR",
                    ['account.number', 'startswith', 67111111],
                    "OR",
                    ['account.number', 'startswith', 67121111]
                ]
            ]);

            transactionQuery81.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery81.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery81.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                //let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 8, name: 'GASTOS FINANCIEROS' },
                        concept: 'GASTOS FINANCIEROS',
                        period: periodId,
                        amount: Number(amount) * -1
                    })
                }

            });

            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery91 = new Basic.CustomSearch('transaction');

            transactionQuery91.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                [
                    ["account.number", "doesnotstartwith", 75],
                    "AND",
                    ["account.number", "doesnotstartwith", 77211112],
                    "AND",
                    ["account.number", "doesnotstartwith", 77611111]
                ],
                "AND",
                ["accounttype", "anyof", "OthIncome"]
            ]);

            transactionQuery91.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery91.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery91.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                //let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });


            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery92 = new Basic.CustomSearch('transaction');

            transactionQuery92.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6477", "6201"]
            ]);

            //transactionQuery81.pushColumn(
            //    { name: 'class', summary: 'GROUP', label: 'classId' }
            //);
            //transactionQuery81.pushColumn(
            //    { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            //);
            transactionQuery92.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery92.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery92.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery92.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                if (number === '67331111') {
                    amount = amount * -1;
                }

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                        concept: 'INGRESOS FINANCIEROS', //SWAP
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada INGRESOS DIVERSOS
            let transactionQuery101 = new Basic.CustomSearch('transaction');

            transactionQuery101.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                //"AND",
                //['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                //"AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"],
                //"AND",
                //["account.number","doesnotstartwith",[75,77211112,77611111]], //[75,77211112,77611111]
                //"AND", 
                //["accounttype","anyof","OthIncome"],
                "AND",
                ['account.number', 'startswith', 75]
            ]);

            transactionQuery101.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery101.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery101.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 10, name: 'INGRESOS DIVERSOS' },
                        concept: 'INGRESOS DIVERSOS',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            //Siguiente seccion agregada DIFERENCIA DE CAMBIO
            let transactionQuery111 = new Basic.CustomSearch('transaction');

            transactionQuery111.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                "AND",
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ["account", "anyof", "6207", "6483"]
            ]);

            transactionQuery111.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery111.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery111.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery111.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                //if (!periodId) {
                //    periodId = '171';
                //}

                if (number === '67611111') {
                    amount = amount * -1;
                }

                if (periodId) {
                    resultTransaction.push({
                        class: { id: 11, name: 'DIFERENCIA DE CAMBIO' },
                        concept: 'DIFERENCIA DE CAMBIO',
                        period: periodId,
                        amount: Number(amount)
                    })
                }

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_antes_particion = {};

            // Iterar sobre los elementos de datos y acumular los valores para class.id 7, 8, 9, 10 y 11
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (classId >= 7 && classId <= 11) {
                    if (!accum_utilidad_antes_particion[classId]) {
                        accum_utilidad_antes_particion[classId] = {};
                    }

                    if (!accum_utilidad_antes_particion[classId][period]) {
                        accum_utilidad_antes_particion[classId][period] = 0;
                    }

                    accum_utilidad_antes_particion[classId][period] += amount;
                }
            });

            // Calcular el resultado acumulado y crear el nuevo objeto JSON
            const result121 = [];

            for (const period in accum_utilidad_antes_particion[7]) {
                const totalAmount = (accum_utilidad_antes_particion[7][period] || 0) +
                    (accum_utilidad_antes_particion[8][period] || 0) +
                    (accum_utilidad_antes_particion[9][period] || 0) +
                    (accum_utilidad_antes_particion[10][period] || 0) +
                    (accum_utilidad_antes_particion[11][period] || 0);

                // Crear el objeto resultante y agregarlo al resultado
                result121.push({
                    class: { id: 12, name: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.' },
                    concept: 'UTILIDAD ANTES DE PARTICIPACIONES E I.R.',
                    period: period,
                    amount: totalAmount,
                });
            }

            result121.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });


            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_ejercicio = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_ejercicio[classId]) {
                    accum_utilidad_ejercicio[classId] = {};
                }

                if (!accum_utilidad_ejercicio[classId][period]) {
                    accum_utilidad_ejercicio[classId][period] = 0;
                }

                accum_utilidad_ejercicio[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result151 = [];

            for (const period in accum_utilidad_ejercicio[12]) {
                const class12Amount = accum_utilidad_ejercicio[12][period];
                const class13Amount = accum_utilidad_ejercicio[13] && accum_utilidad_ejercicio[13][period] ? accum_utilidad_ejercicio[13][period] : 0;
                const class14Amount = accum_utilidad_ejercicio[14] && accum_utilidad_ejercicio[14][period] ? accum_utilidad_ejercicio[14][period] : 0;
                const totalAmount = class12Amount - class13Amount - class14Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result151.push({
                    class: { id: 15, name: "UTILIDAD DEL EJERCICIO" },
                    concept: "UTILIDAD DEL EJERCICIO",
                    period: period,
                    amount: totalAmount,
                });
            }

            result151.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });

            // Crear un objeto para mantener un seguimiento de las acumulaciones por class.id
            const accum_utilidad_neta = {};

            // Iterar sobre los elementos de datos y acumular los valores
            resultTransaction.forEach((item) => {
                const classId = item.class.id;
                const period = item.period;
                const amount = item.amount;

                if (!accum_utilidad_neta[classId]) {
                    accum_utilidad_neta[classId] = {};
                }

                if (!accum_utilidad_neta[classId][period]) {
                    accum_utilidad_neta[classId][period] = 0;
                }

                accum_utilidad_neta[classId][period] += amount;
            });

            // Calcular la resta entre class.id 2, 5 y 6 por período
            const result171 = [];

            for (const period in accum_utilidad_neta[15]) {
                const class15Amount = accum_utilidad_neta[15][period];
                const class16Amount = accum_utilidad_neta[16] && accum_utilidad_neta[16][period] ? accum_utilidad_neta[16][period] : 0;
                const totalAmount = class15Amount + class16Amount;

                // Crear el objeto resultante y agregarlo al resultado
                result171.push({
                    class: { id: 17, name: "UTILIDAD NETA" },
                    concept: "UTILIDAD NETA",
                    period: period,
                    amount: totalAmount,
                });
            }

            result171.forEach(node => {

                resultTransaction.push({
                    class: { id: node.class.id, name: node.class.name },
                    concept: node.concept,
                    period: node.period,
                    amount: Number(node.amount)
                })

            });*/

            //resultTransaction.sort((a, b) => a.class.id - b.class.id);

            log.debug('resultTransaction', resultTransaction);

            resultTransaction.sort(function (a, b) {
                if (a.class.id !== b.class.id) {
                    return a.class.id - b.class.id;
                }
                return a.concept.localeCompare(b.concept);
            });

            return resultTransaction;
        }

        class GastosComparativosGroup1 extends ReportRenderer {

            constructor(input) {
                if (input.xls == 'T') {
                    super(Basic.Data.Report.GASTOS_COMPARATIVOS_XLS);
                } else {
                    super(Basic.Data.Report.GASTOS_INDIRECTOS);
                }
                log.debug('Template', 'Was Loading....');

                let { subsidiary, view, year, month, decimal, report } = input;
                hasDecimal = decimal == 'T' || decimal == true ? 'F' : 'T';

                selectReport = REPORTS[report];

                classes = Basic.Classes[selectReport];

                let descriptionMap = {
                    report: '',
                    view: '',
                    year: '',
                    month: ''
                };

                if (selectReport == 'GASTOS_INDIRECTOS') {
                    descriptionMap.report = 'Gastos Indirectos de Fabricación';
                }
                if (selectReport == 'GASTOS_ADM_OP') {
                    descriptionMap.report = 'Gastos Administrativos (Operación)';
                }
                if (selectReport == 'GASTOS_ADM_OF') {
                    descriptionMap.report = 'Gastos Administrativos (Oficina)';
                }
                if (selectReport == 'GASTOS_VENTAS') {
                    descriptionMap.report = 'Gastos de Ventas';
                }

                log.debug('Action', 'Set Report Name to Object')

                let currentYear = year;

                let lastYear = null;

                let currentYearContext = null;
                let lastYearContext = null;

                let yearList = Operations.createAccountingPeriodYear();

                let currentPositionYear = -1;

                for (var i = 0; i < yearList.length; i++) {
                    let lineYear = yearList[i].id;
                    if (currentYear == lineYear) {
                        currentYearContext = yearList[i];
                        currentPositionYear = i;
                        break;
                    }
                }

                lastYearContext = yearList[currentPositionYear + 1];
                lastYear = yearList[currentPositionYear + 1].id;

                let currentPeriods = [];
                let lastPeriods = [];
                let transactionList = [];

                descriptionMap.year = currentYearContext.text;

                if (view == Basic.Data.View.DETAILED) {
                    descriptionMap.view = 'Detallado';
                    // currentPeriods = Operations.createAccountingPeriodByYear(currentYear).reverse();
                    // lastPeriods = Operations.createAccountingPeriodByYear(lastYear).reverse();

                    //
                    // [Change Request]
                    // Slice the array months, first look for the position of a month, 
                    //
                    let currentMonth = month;
                    let auxCurrentPeriods = Operations.createAccountingPeriodByYear(currentYear).reverse();
                    let auxLastPeriods = Operations.createAccountingPeriodByYear(lastYear).reverse();

                    for (var i = 0; i < auxCurrentPeriods.length; i++) {

                        currentPeriods.push(auxCurrentPeriods[i]);
                        lastPeriods.push(auxLastPeriods[i]);

                        if (auxCurrentPeriods[i].id == currentMonth) {
                            break;
                        }

                    }
                    //***************************************************************

                    let totalPeriods = currentPeriods.map(node => { return node.id });

                    transactionList = createTransactionDetailsByPeriod(totalPeriods, subsidiary);

                    // transactionList = transactionList.concat(
                    //     createTransactionDetailsByPeriod(totalPeriods.slice(6, 12), subsidiary)
                    // );

                    totalPeriods = lastPeriods.map(node => { return node.id });

                    transactionList = transactionList.concat(createTransactionDetailsByPeriod(totalPeriods, subsidiary));

                    // transactionList = transactionList.concat(createTransactionDetailsByPeriod(totalPeriods.slice(6, 12), subsidiary));

                }

                if (view == Basic.Data.View.QUARTERLY) {
                    descriptionMap.view = 'Trimestral';
                    currentPeriods = Operations.createAccountingQuarterByYear(currentYear).reverse();
                    lastPeriods = Operations.createAccountingQuarterByYear(lastYear).reverse();
                    transactionList = createTransactionDetailsByQuarter([currentYear, lastYear], subsidiary);
                }

                if (view == Basic.Data.View.MONTHLY) {
                    descriptionMap.view = 'Mensual';

                    let currentMonth = month;
                    let auxCurrentPeriods = Operations.createAccountingPeriodByYear(currentYear).reverse();
                    let auxLastPeriods = Operations.createAccountingPeriodByYear(lastYear).reverse();

                    for (var i = 0; i < auxCurrentPeriods.length; i++) {

                        currentPeriods.push(auxCurrentPeriods[i]);
                        lastPeriods.push(auxLastPeriods[i]);
                        if (auxCurrentPeriods[i].id == currentMonth) {

                            descriptionMap.month = auxCurrentPeriods[i].text;
                            break;
                        }

                    }


                    let totalPeriods = currentPeriods.map(node => { return node.id });

                    transactionList = createTransactionDetailsByPeriod(totalPeriods, subsidiary);

                    // transactionList = transactionList.concat(
                    //     createTransactionDetailsByPeriod(totalPeriods.slice(6, 12), subsidiary)
                    // );

                    totalPeriods = lastPeriods.map(node => { return node.id });

                    transactionList = transactionList.concat(createTransactionDetailsByPeriod(totalPeriods, subsidiary));
                }

                if (view == Basic.Data.View.ANNUAL) {
                    descriptionMap.view = 'Anual';

                    currentPeriods = Operations.createAccountingQuarterByYear(currentYear).reverse();
                    lastPeriods = Operations.createAccountingQuarterByYear(lastYear).reverse();
                    transactionList = createTransactionsDetailsByYear([currentYear, lastYear], subsidiary);

                    currentPeriods = yearList.filter(node => { return node.id == currentYear });
                    lastPeriods = yearList.filter(node => { return node.id == lastYear });
                }


                let currentYearMap = {};
                let lastYearMap = {};

                currentPeriods.forEach(node => {
                    currentYearMap[node.id] = true;
                });
                lastPeriods.forEach(node => {
                    lastYearMap[node.id] = true;
                })

                let headersList = [];
                let totalMap = {};
                let summaryMap = {
                    current: {
                        ...currentYearContext,
                        amount: 0
                    }, last: {
                        ...lastYearContext,
                        amount: 0
                    }
                };

                for (var i = 0; i < currentPeriods.length; i++) {
                    headersList.push({
                        current: currentPeriods[i],
                        last: lastPeriods[i],
                    });
                    totalMap[currentPeriods[i].id] = 0;
                    totalMap[lastPeriods[i].id] = 0;

                }

                let costCenterMap = {};

                transactionList.forEach(node => {

                    let id = node.class.id;
                    let name = node.class.name;
                    let concept = node.concept;
                    let period = node.period;
                    let amount = node.amount;

                    let currentPeriods = {};
                    headersList.forEach(node => {
                        currentPeriods[node.current.id] = 0;
                        currentPeriods[node.last.id] = 0;

                    })

                    if (!costCenterMap[id]) {
                        costCenterMap[id] = {
                            id,
                            name,
                            concepts: {},
                            period: JSON.parse(JSON.stringify(currentPeriods)),
                            current: 0,
                            last: 0
                        };
                    }

                    if (!costCenterMap[id].concepts[concept]) {

                        costCenterMap[id].concepts[concept] = {
                            name: concept,
                            periods: JSON.parse(JSON.stringify(currentPeriods)),
                            current: 0,
                            last: 0
                        };

                    }


                    costCenterMap[id].concepts[concept].periods[period] =
                        sumAmount(costCenterMap[id].concepts[concept].periods[period], amount)

                    if (currentYearMap[period]) {
                        // costCenterMap[id].concepts[concept].current += Number(amount);
                        // costCenterMap[id].current += Number(amount);
                        // summaryMap.current.amount += Number(amount);
                        costCenterMap[id].concepts[concept].current = sumAmount(
                            costCenterMap[id].concepts[concept].current, amount);

                        costCenterMap[id].current = sumAmount(
                            costCenterMap[id].current, amount);

                        log.debug("Amount: " + amount, summaryMap);
                        summaryMap.current.amount = sumAmount(
                            summaryMap.current.amount, amount);

                    }
                    if (lastYearMap[period]) {

                        costCenterMap[id].concepts[concept].last = sumAmount(
                            costCenterMap[id].concepts[concept].last, amount);

                        costCenterMap[id].last = sumAmount(costCenterMap[id].last, amount);

                        summaryMap.last.amount = sumAmount(summaryMap.last.amount, amount);
                        // costCenterMap[id].concepts[concept].last += Number(amount);
                        // costCenterMap[id].last += Number(amount);
                        // summaryMap.last.amount += Number(amount);
                    }
                    costCenterMap[id].period[period] = sumAmount(costCenterMap[id].period[period], amount);
                    totalMap[period] = sumAmount(totalMap[period], amount)

                    // costCenterMap[id].period[period] += Number(amount)
                    // totalMap[period] += Number(amount);

                });

                //*************************************************************************
                // Change 10/10/2023, Filter the months header depending of the report 
                //

                // if (view == Basic.Data.View.DETAILED && month) {
                //     let auxiliary = [];
                //     for (var i = 0; i < headersList.length; i++) {
                //         auxiliary.push(headersList[i]);
                //         if (headersList[i].current.id == month) {
                //             break;
                //         }
                //     }
                //     headersList = auxiliary;
                // }


                if (view == Basic.Data.View.MONTHLY && month) {

                    let auxiliary = [];
                    for (var i = 0; i < headersList.length; i++) {
                        if (headersList[i].current.id == month) {
                            auxiliary.push(headersList[i]);
                            break;
                        }
                    }
                    headersList = auxiliary;
                }

                //***************************************************************************


                for (var costCenter in costCenterMap) {
                    costCenterMap[costCenter].concepts = Object.values(costCenterMap[costCenter].concepts).sort((a, b) => {

                        //let variationA = a.current - a.last;
                        //let variationB = b.current - b.last;

                        //return Number(variationB) - Number(variationA);
                        return a.name - b.name;
                    });
                }

                let arrayCenters = Object.values(costCenterMap);

                //arrayCenters = arrayCenters.sort((a, b) => {
                //    let variationA = a.current - a.last;
                //    let variationB = b.current - b.last;
                //    return Number(variationB) - Number(variationA);
                //});

                log.debug('summaryMap', summaryMap);
                this.addInput('headers', headersList);
                this.addInput('total', totalMap);
                this.addInput('centers', arrayCenters);
                this.addInput('summary', summaryMap);
                this.addInput('decimal', decimal == 'T' || decimal == true ? 'T' : 'F');
                this.addInput('description', descriptionMap);

            }

        }

        return GastosComparativosGroup1

    });