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

            let transactionQuery = new Basic.CustomSearch('transaction');

            transactionQuery.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                //["accountingperiod.isadjust", "is", "F"],
                //'AND',
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
            transactionQuery.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            transactionQuery.execute(node => {

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

            //Siguiente seccion agregada
            let transactionQuery1 = new Basic.CustomSearch('transaction');

            transactionQuery1.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                //["accountingperiod.isadjust", "is", "F"],
                //'AND',
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

            transactionQuery1.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery1.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );

            log.debug("length", transactionQuery1.context.columns.length)

            //if (transactionQuery1.context.columns.length === 0) {
            resultTransaction.push({
                class: { id: 0, name: 'VENTA NACIONAL' },
                concept: 'Materias Primas',
                period: '171',
                amount: 0
            })
            resultTransaction.push({
                class: { id: 0, name: 'VENTA NACIONAL' },
                concept: 'Materias Primas',
                period: '291',
                amount: 0
            })
            //} else {
            //    transactionQuery1.execute(node => {
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



            //Siguiente seccion agregada
            let transactionQuery2 = new Basic.CustomSearch('transaction');

            transactionQuery2.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
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

            transactionQuery2.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery2.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery2.execute(node => {

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

            //Siguiente seccion agregada
            let transactionQuery3 = new Basic.CustomSearch('transaction');

            transactionQuery3.updateFilters([
                //["account.custrecord_bio_cam_cuenta_concepto", "isnotempty", ""],
                //"AND",
                ["accountingperiod.parent", "anyof"].concat(years),
                "AND",
                //["accountingperiod.isadjust", "is", "F"],
                //'AND',
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

            transactionQuery3.pushColumn(
                { name: 'parent', join: "accountingperiod", summary: 'GROUP', label: 'period' }
            );
            transactionQuery3.pushColumn(
                { name: 'amount', summary: 'SUM', label: 'amount' }
            );


            transactionQuery3.execute(node => {

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
                    concept: 'PT Exportación',
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
