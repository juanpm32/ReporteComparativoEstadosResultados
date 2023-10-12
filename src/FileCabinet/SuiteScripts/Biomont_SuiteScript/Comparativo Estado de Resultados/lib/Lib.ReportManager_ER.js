/**
 * @NApiVersion 2.1
 */
define([

    './reports/Class.GastosIndirectosFabricacionReport_ER',
    './reports/Class.GastosAdministrativosOperacion_ER',
    './reports/Class.GastosAdministrativosOficina_ER',
    './reports/Class.GastosVentas_ER',
    './reports/Class.GastosTransactiones_ER'
],

    function (
        GastosIndirectosFabricacionReport,
        GastosAdministrativosOperacion,
        GastosAdministrativosOficina,
        GastosVentas,
        GastosTransactiones
    ) {

        return {
            GastosIndirectosFabricacionReport,
            GastosAdministrativosOperacion,
            GastosAdministrativosOficina,
            GastosVentas,
            GastosTransactiones
        }

    });
