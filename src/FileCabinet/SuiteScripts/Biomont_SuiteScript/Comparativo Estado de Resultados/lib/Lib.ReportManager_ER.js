/**
 * @NApiVersion 2.1
 */
    define([
        './reports/Class.GastosComparativosGroup_ER',
        './reports/Class.GastosComparativosGroup1_ER',
        './reports/Class.GastosTransactiones_ER'
    ],
    
        function (
            GastosComparativosGroup,
            GastosComparativosGroup1,
            GastosTransactiones
        ) {
    
            return {
                GastosComparativosGroup,
                GastosComparativosGroup1,
                GastosTransactiones
            }
    
        });
    