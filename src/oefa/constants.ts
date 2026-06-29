export const JSF_FORM = {
    formId: 'listarDetalleInfraccionRAAForm',

    fields: {
        nroExpediente: 'listarDetalleInfraccionRAAForm:txtNroexp',
        administrado: 'listarDetalleInfraccionRAAForm:j_idt21',
        unidadFiscalizable: 'listarDetalleInfraccionRAAForm:j_idt25',
        sector: 'listarDetalleInfraccionRAAForm:idsector',
        nroResolucionApelacion: 'listarDetalleInfraccionRAAForm:j_idt34',
        scrollState: 'listarDetalleInfraccionRAAForm:dt_scrollState',
    },

    buttons: {
        buscar: 'listarDetalleInfraccionRAAForm:btnBuscar',
    },

    dataTable: {
        id: 'listarDetalleInfraccionRAAForm:dt',
        pgListaRegion: 'listarDetalleInfraccionRAAForm:pgLista',
        rowsPerPage: 10,
    },

    viewStateInputName: 'javax.faces.ViewState',
} as const;

export const SECTOR_OPTIONS: Record<string, string> = {
    TODOS: '',
    ELECTRICIDAD: '2',
    HIDROCARBUROS: '3',
    INDUSTRIA: '9',
    MINERIA: '1',
    PESQUERIA: '8',
};