/**
 * @NApiVersion 2.1
 */
    define([
        './reports/Class.GastosComparativosGroup_ER',
        './reports/Class.GastosTransactiones_ER'
    ],
    
        function (
            GastosComparativosGroup,
            GastosTransactiones
        ) {
    
            return {
                GastosComparativosGroup,
                GastosTransactiones
            }
    
        });
    