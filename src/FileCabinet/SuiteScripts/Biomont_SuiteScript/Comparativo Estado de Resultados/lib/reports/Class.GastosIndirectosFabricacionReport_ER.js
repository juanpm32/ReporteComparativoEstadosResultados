/**
 * @NApiVersion 2.1
 */
define(['N', './Class.ReportRenderer_ER', '../Lib.Basic_ER', '../Lib.Operations_ER'],

    function (N, ReportRenderer, Basic, Operations) {

        const { search, log } = N;

        var classes = Basic.Classes.GASTOS_INDIRECTOS;

        function createAccountNumberFilter() {
            let filter = ['AND'];
            filter.push(['account.number', 'startswith', Basic.Account.True.GASTOS_INDIRECTOS]);

            Basic.Account.False.GASTOS_INDIRECTOS.forEach(number => {
                filter.push('AND');
                filter.push(['account.number', 'doesnotstartwith', number]);
            });

            return filter;
        }

        function createTransactionDetailsByMonth(periods, subsidiary) {

            let resultTransaction = [];

            let transactionQuery = new Basic.CustomSearch('transaction');

            transactionQuery.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.internalid", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat(classes),
                'AND',
                ['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                "AND",
                ["type", "noneof", "PurchReq"]
            ].concat(createAccountNumberFilter())
            );

            transactionQuery.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: classId, name: className },
                    concept: concept,
                    period: periodId,
                    amount: Number(amount)
                })
            });

            return resultTransaction;
        }

        function createTransactionDetailsByPeriod(periods, subsidiary) {

            let resultTransaction = [];

            let transactionQuery = new Basic.CustomSearch('transaction');

            transactionQuery.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(periods),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat(classes),
                'AND',
                ['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                "AND",
                ["type", "noneof", "PurchReq"]
            ].concat(createAccountNumberFilter())
            );

            transactionQuery.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery.pushColumn(
                { name: 'postingperiod', summary: 'GROUP', label: 'period' }
            );
            transactionQuery.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: classId, name: className },
                    concept: concept,
                    period: periodId,
                    amount: Number(amount)
                })
            });

            return resultTransaction;
        }

        function createTransactionDetailsByQuarter(quarters, subsidiary) {
            let resultTransaction = [];

            let transactionQuery = new Basic.CustomSearch('transaction');

            transactionQuery.updateFilters([
                ["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                "AND",
                ["accountingperiod.parent", "anyof"].concat(quarters),
                "AND",
                ["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                "AND",
                ['class', 'anyof'].concat(classes),
                'AND',
                ['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                "AND",
                ["type", "noneof", "PurchReq"]
            ].concat(createAccountNumberFilter())
            );

            transactionQuery.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery.pushColumn(
                { name: 'custrecord_bio_cam_cuenta_concepto', join: 'account', summary: 'GROUP', label: 'concept' }
            );
            transactionQuery.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery.execute(node => {

                let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');
                let periodId = node.getValue('period');
                let periodName = node.getText('period')
                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: classId, name: className },
                    concept: concept,
                    period: periodId,
                    amount: Number(amount)
                })
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

            log.debug('quarterYearMap', quarterYearMap);

            let resultTransaction = [];

            // Siguiente seccion agregada VENTA NACIONAL
            // Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery11 = new Basic.CustomSearch('transaction');

            transactionQuery11.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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
                ['account.number', 'startswith', 701]
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
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery11.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery11.execute(node => {

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Mercaderias',
                    period: periodId,
                    amount: Number(amount)
                })
            });

            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery12 = new Basic.CustomSearch('transaction');

            transactionQuery12.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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

            log.debug("years", years)

            years.forEach(year => {
                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'Materias Primas',
                    period: year,
                    amount: 0
                })
            })

            //if (transactionQuery12.context.columns.length === 0) {
            //resultTransaction.push({
            //    class: { id: 0, name: 'VENTA NACIONAL' },
            //    concept: 'Materias Primas',
            //    period: '171',
            //    amount: 0
            //})
            //resultTransaction.push({
            //    class: { id: 0, name: 'VENTA NACIONAL' },
            //    concept: 'Materias Primas',
            //    period: '291',
            //    amount: 0
            //})
            //} else {
            //    transactionQuery12.execute(node => {
            //
            //        //let classId = node.getValue('classId');
            //        //let className = node.getValue('className');
            //        //let concept = node.getValue('concept');
            //
            //        let periodId = node.getValue('period');
            //        periodId = quarterYearMap[periodId];
            //
            //        let amount = node.getValue('amount');
            //
            //        resultTransaction.push({
            //            class: { id: 0, name: 'VENTA NACIONAL' },
            //            concept: 'Materias Primas',
            //            period: periodId,
            //            amount: Number(amount)
            //        })
            //
            //    });
            //}


            //Siguiente seccion agregada CONCEPTO PT Nacional
            let transactionQuery13 = new Basic.CustomSearch('transaction');

            transactionQuery13.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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
                ['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
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

                if (!periodId) {
                    periodId = '171';
                }

                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'PT Nacional',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada CONCEPTO PT Exportación
            let transactionQuery14 = new Basic.CustomSearch('transaction');

            transactionQuery14.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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
                ['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
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

                if (!periodId) {
                    periodId = '291';
                }

                let amount = node.getValue('amount');

                resultTransaction.push({
                    class: { id: 0, name: 'VENTA NACIONAL' },
                    concept: 'PT Exportacion',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada COSTO DE VENTA
            //Siguiente seccion agregada CONCEPTO Mercaderias
            let transactionQuery21 = new Basic.CustomSearch('transaction');

            transactionQuery21.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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

                if (!periodId) {
                    periodId = '171';
                }

                resultTransaction.push({
                    class: { id: 1, name: 'COSTO DE VENTAS' },
                    concept: 'Mercaderias',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada CONCEPTO Materias Primas
            let transactionQuery22 = new Basic.CustomSearch('transaction');

            transactionQuery22.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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

                if (!periodId) {
                    periodId = '171';
                }

                resultTransaction.push({
                    class: { id: 1, name: 'COSTO DE VENTAS' },
                    concept: 'Materias Primas',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada CONCEPTO Venta Nacional
            let transactionQuery23 = new Basic.CustomSearch('transaction');

            transactionQuery23.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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
                ['customer.internalid', 'noneof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
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

                if (!periodId) {
                    periodId = '171';
                }

                resultTransaction.push({
                    class: { id: 1, name: 'COSTO DE VENTAS' },
                    concept: 'PT Nacional',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada CONCEPTO Exportación
            let transactionQuery24 = new Basic.CustomSearch('transaction');

            transactionQuery24.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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
                    ['account.number', 'startswith', 692]
                    //"OR",
                    //['account.number', 'startswith', 699]
                ],
                "AND",
                ['customer.internalid', 'anyof', [475, 22055, 22056, 22057, 22058, 22059, 22061, 22063, 22067, 22068, 22069, 22070, 22071, 22073, 22074, 22075, 22077, 22079, 23438, 23790, 23825, 24079, 28080]]
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

                if (!periodId) {
                    periodId = '291';
                }

                resultTransaction.push({
                    class: { id: 1, name: 'COSTO DE VENTAS' },
                    concept: 'PT Exportacion',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada CONCEPTO Desvalorizacion Existencias
            let transactionQuery25 = new Basic.CustomSearch('transaction');

            transactionQuery25.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["type","noneof","Estimate","SalesOrd","Opprtnty"],
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

                //let classId = node.getValue('classId');
                //let className = node.getValue('className');
                //let concept = node.getValue('concept');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 1, name: 'COSTO DE VENTAS' },
                    concept: 'Desvalorizacion Existencias',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OPERACIONAL
            let transactionQuery31 = new Basic.CustomSearch('transaction');

            transactionQuery31.updateFilters([
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
                ['class', 'anyof'].concat([33,1,2,3,4,5,6,7]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number","doesnotstartwith",[60,61,67,69]]
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
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 3, name: 'GASTO ADMINISTRATIVO OPERACIONAL' },
                    concept: className,
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada GASTO ADMINISTRATIVO OFICINA
            let transactionQuery41 = new Basic.CustomSearch('transaction');

            transactionQuery41.updateFilters([
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
                ['class', 'anyof'].concat([29, 14, 15, 16, 17, 18, 19, 20]),
                "AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                ["type", "noneof", "PurchReq"],
                "AND",
                ['account.number', 'startswith', 6],
                "AND",
                ["account.number","doesnotstartwith",[60,61,67,69]]
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

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 4, name: 'GASTO ADMINISTRATIVO OFICINA' },
                    concept: className,
                    period: periodId,
                    amount: Number(amount)
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
                ["account.number","doesnotstartwith",[60,61,67,69]]
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

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 6, name: 'GASTO DE VENTA' },
                    concept: className,
                    period: periodId,
                    amount: Number(amount)
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

                ] //[67311111,67311112,67311113,67311115,67311114,67321111,67141111,67141112,67351111,67361111,67111111,67121111]
                //"AND",
                //["account.number","doesnotstartwith",[75,77211112,77611111]], //[75,77211112,77611111]
                //"AND", 
                //["accounttype","anyof","OthIncome"],
                /*"AND", 
                ["account","anyof",[6477,6201]]*/
            ]);

            /*transactionQuery81.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery81.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery81.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );*/
            transactionQuery81.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery81.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery81.execute(node => {

                /*let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');*/

                //let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 8, name: 'GASTOS FINANCIEROS' },
                    concept: 'GASTOS FINANCIEROS',
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada INGRESOS FINANCIEROS
            let transactionQuery91 = new Basic.CustomSearch('transaction');

            transactionQuery91.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                //["type","noneof","Estimate","SalesOrd","Opprtnty"],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                //"AND",
                //["accountingperiod.isadjust", "is", "F"],
                'AND',
                ['subsidiary', 'anyof', subsidiary],
                //"AND",
                //['class', 'anyof'].concat([21, 22, 23, 24, 25, 26, 27]),
                //"AND",
                //['account.custrecord_bio_cam_cuenta_concepto', 'isnotempty', ''],
                //"AND",
                //["type", "noneof", "PurchReq"],
                "AND",
                /*[ // PRIMERA CONDICION
                    ["account.number","doesnotstartwith",75],
                    "AND",
                    ["account.number","doesnotstartwith",77211112],
                    "AND",
                    ["account.number","doesnotstartwith",77611111]
                ],
                "AND", */
                [ 
                    ["account.number","startswith",77211112],
                    "OR",
                    ["account.number","startswith",67331111]
                ],
                "AND",
                ["accounttype","anyof","OthIncome"]
            ]);

            /*transactionQuery81.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery81.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );*/
            transactionQuery91.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );
            transactionQuery91.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery91.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery91.execute(node => {

                /*let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');*/

                let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 9, name: 'INGRESOS FINANCIEROS' },
                    concept: number,
                    period: periodId,
                    amount: Number(amount)
                })

            });

            //Siguiente seccion agregada INGRESOS DIVERSOS
            let transactionQuery111 = new Basic.CustomSearch('transaction');

            transactionQuery111.updateFilters([
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
                /*"AND", 
                ["account","anyof",[6477,6201]]*/
            ]);

            /*transactionQuery81.pushColumn(
                { name: 'class', summary: 'GROUP', label: 'classId' }
            );
            transactionQuery81.pushColumn(
                { name: 'classnohierarchy', summary: 'GROUP', label: 'className' }
            );
            transactionQuery81.pushColumn(
                { name: 'number', join: 'account', summary: 'GROUP', label: 'number' }
            );*/
            transactionQuery111.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery111.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery111.execute(node => {

                /*let classId = node.getValue('classId');
                let className = node.getValue('className');
                let concept = node.getValue('concept');*/

                //let number = node.getValue('number');

                let periodId = node.getValue('period');
                periodId = quarterYearMap[periodId];

                let amount = node.getValue('amount');

                /*if (!periodId) {
                    periodId = '171';
                }*/

                resultTransaction.push({
                    class: { id: 11, name: 'INGRESOS DIVERSOS' },
                    concept: 'INGRESOS DIVERSOS',
                    period: periodId,
                    amount: Number(amount)
                })

            });


            log.debug("resultTransaction", resultTransaction)


            return resultTransaction;
        }

        class GastosIndirectosFabricacionReport extends ReportRenderer {

            constructor(input) {

                super(Basic.Data.Report.GASTOS_INDIRECTOS);

                let { subsidiary, view, year, month, decimal } = input;

                log.debug('CurrentMonth', month);

                let currentYear = year;

                let lastYear = null;

                let yearList = Operations.createAccountingPeriodYear();

                let currentPositionYear = -1;

                for (var i = 0; i < yearList.length; i++) {
                    let lineYear = yearList[i].id;
                    if (currentYear == lineYear) {
                        currentPositionYear = i;
                        break;
                    }
                }

                lastYear = yearList[currentPositionYear + 1].id;

                let currentPeriods = [];
                let lastPeriods = [];
                let transactionList = [];


                if (view == Basic.Data.View.DETAILED) {

                    currentPeriods = Operations.createAccountingPeriodByYear(currentYear).reverse();
                    lastPeriods = Operations.createAccountingPeriodByYear(lastYear).reverse();
                    transactionList = createTransactionDetailsByPeriod([currentYear, lastYear], subsidiary);
                }

                if (view == Basic.Data.View.QUARTERLY) {
                    currentPeriods = Operations.createAccountingQuarterByYear(currentYear).reverse();
                    lastPeriods = Operations.createAccountingQuarterByYear(lastYear).reverse();
                    transactionList = createTransactionDetailsByQuarter([currentYear, lastYear], subsidiary);
                }

                if (view == Basic.Data.View.MONTHLY) {

                    let currentMonth = month;
                    let auxCurrentPeriods = Operations.createAccountingPeriodByYear(currentYear).reverse();
                    let auxLastPeriods = Operations.createAccountingPeriodByYear(lastYear).reverse();

                    for (var i = 0; i < auxCurrentPeriods.length; i++) {

                        if (auxCurrentPeriods[i].id == currentMonth) {
                            currentPeriods.push(auxCurrentPeriods[i]);
                            lastPeriods.push(auxLastPeriods[i]);
                            break;
                        }

                    }
                    transactionList = createTransactionDetailsByMonth([currentPeriods[0].id, lastPeriods[0].id], subsidiary);
                }

                if (view == Basic.Data.View.ANNUAL) {
                    currentPeriods = Operations.createAccountingQuarterByYear(currentYear).reverse();
                    lastPeriods = Operations.createAccountingQuarterByYear(lastYear).reverse();
                    transactionList = createTransactionsDetailsByYear([currentYear, lastYear], subsidiary);

                    currentPeriods = yearList.filter(node => { return node.id == currentYear });
                    lastPeriods = yearList.filter(node => { return node.id == lastYear });
                }

                let headersList = [];
                let totalMap = {};

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
                        costCenterMap[id] = { id, name, concepts: {}, period: JSON.parse(JSON.stringify(currentPeriods)) };
                    }

                    if (!costCenterMap[id].concepts[concept]) {

                        costCenterMap[id].concepts[concept] = { name: concept, periods: JSON.parse(JSON.stringify(currentPeriods)) };
                    }
                    costCenterMap[id].concepts[concept].periods[period] += Number(amount);

                    costCenterMap[id].period[period] += Number(amount)

                    totalMap[period] += Number(amount);

                });


                for (var costCenter in costCenterMap) {
                    costCenterMap[costCenter].concepts = Object.values(costCenterMap[costCenter].concepts).sort((a, b) => {
                        if (a.name > b.name) {
                            return 1;
                        }
                        if (a.name < b.name) {
                            return -1;
                        }
                        return 0;
                    });
                }

                if (decimal == 'T' || decimal == true) {

                    for (var x in totalMap) {
                        totalMap[x] = Number(totalMap[x].toFixed(0))
                    }

                    for (var costCenter in costCenterMap) {

                        for (var p in costCenterMap[costCenter].period) {
                            costCenterMap[costCenter].period[p] = Number(costCenterMap[costCenter].period[p].toFixed(0))
                        }

                        let conceptMap = costCenterMap[costCenter].concepts;

                        for (var c in conceptMap) {
                            for (var p in conceptMap[c].periods) {
                                conceptMap[c].periods[p] = Number(conceptMap[c].periods[p].toFixed(0))
                            }
                        }

                    }

                }

                this.addInput('headers', headersList);
                this.addInput('total', totalMap);
                this.addInput('centers', Object.values(costCenterMap));

            }

        }

        return GastosIndirectosFabricacionReport

    });
