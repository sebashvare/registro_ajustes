import type { RequestHandler } from './$types';

// Simulación de base de datos
let registrosDB = [
  {
    id: '1',
    id_cuenta: 'ACC-001',
    id_acuerdo_servicio: 'AS-001',
    id_cargo_facturable: 'CF-001',
    fecha_ajuste: '2025-01-01',
    asesor_que_ajusto: 'Juan Pérez',
    valor_ajustado: 150000,
    justificacion: 'Se detectó un sobrecobro en el periodo anterior',
    created_at: '2025-01-01T10:00:00Z'
  },
  {
    id: '2',
    id_cuenta: 'ACC-002',
    id_acuerdo_servicio: 'AS-002',
    id_cargo_facturable: 'CF-002',
    fecha_ajuste: '2025-01-02',
    asesor_que_ajusto: 'María García',
    valor_ajustado: -75000,
    justificacion: 'Compensación por falla técnica del 15-20 de diciembre',
    created_at: '2025-01-02T14:30:00Z'
  },
  {
    id: '3',
    id_cuenta: 'ACC-003',
    id_acuerdo_servicio: 'AS-003',
    id_cargo_facturable: 'CF-003',
    fecha_ajuste: '2025-01-03',
    asesor_que_ajusto: 'Carlos Rodríguez',
    valor_ajustado: 200000,
    justificacion: 'Ajuste por servicios adicionales no facturados',
    created_at: '2025-01-03T09:15:00Z'
  }
];

export const GET: RequestHandler = async () => {
  const headers = [
    'ID Cuenta',
    'ID Acuerdo Servicio',
    'ID Cargo Facturable',
    'Fecha Ajuste',
    'Asesor',
    'Valor Ajustado',
    'Justificación',
    'Fecha Creación'
  ];
  
  const csvContent = [
    headers.join(','),
    ...registrosDB.map(registro =>
      [
        registro.id_cuenta,
        registro.id_acuerdo_servicio,
        registro.id_cargo_facturable,
        registro.fecha_ajuste,
        `"${registro.asesor_que_ajusto}"`,
        registro.valor_ajustado,
        `"${registro.justificacion}"`,
        registro.created_at
      ].join(',')
    )
  ].join('\n');
  
  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="registros_ajustes_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
};