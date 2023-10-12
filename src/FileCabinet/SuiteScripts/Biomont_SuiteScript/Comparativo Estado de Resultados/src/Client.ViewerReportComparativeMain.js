/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N'],

function(N) {

    const { search } = N;
    
    const FIELDS = {
        view: 'custpage_report_criteria_view',
        year: 'custpage_report_criteria_year',
        month: 'custpage_report_criteria_month'
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


    function fieldChanged(scriptContext) {

        if (scriptContext.fieldId == FIELDS.view || scriptContext.fieldId == FIELDS.year) {

            let viewValue = scriptContext.currentRecord.getValue(FIELDS.view);
            let yearValue = scriptContext.currentRecord.getValue(FIELDS.year);
            let monthField = scriptContext.currentRecord.getField(FIELDS.month);

            if (viewValue == 'D') {
                monthField.isDisabled = false;
                monthField.removeSelectOption({ value: null })
                createAccountingPeriodByYear(yearValue).forEach(node => {
                    monthField.insertSelectOption({ value: node.id, text: node.text });
                });
            }
            else {
                monthField.isDisabled = true;
                monthField.removeSelectOption({ value: null })
            }

        }

    }

    return { fieldChanged };
    
});
