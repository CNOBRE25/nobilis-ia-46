// Cargos e unidades
export const CARGOS_INVESTIGADO = [
  "SD PM","SD BM","CB PM","CB BM","3º SGT PM","3º SGT BM","2º SGT PM","2º SGT BM",
  "1º SGT PM","1º SGT BM","ST PM","ST BM","2º TEN PM","2º TEN BM","1º TEN PM",
  "1º TEN BM","CAP PM","CAP BM","MAJOR PM","MAJOR BM","TC PM","TC BM",
  "CORONEL PM","CORONEL BM","DPC","APC","EPC","PERITO CRIMINAL","ASP",
  "Papiloscopista","Assistente de Gestão Publica","Identificador Civil e Criminal",
  "Perito","Medico Legista","Agente de Pericia Criminal","Agente de Medicina Legal",
  "Assistente de Gestão Publica"
];

export const UNIDADES_PM = [
  "1º BPM","2º BPM","3º BPM","4º BPM","5º BPM","6º BPM","7º BPM","8º BPM",
  "9º BPM","10º BPM","11º BPM","12º BPM","13º BPM","14º BPM","15º BPM",
  "16º BPM","17º BPM","18º BPM","19º BPM","20º BPM","21º BPM","22º BPM",
  "23º BPM","24º BPM","25º BPM","26º BPM","1ª CIPM","2ª CIPM","3ª CIPM",
  "4ª CIPM","5ª CIPM","6ª CIPM","7ª CIPM","8ª CIPM","9ª CIPM","10ª CIPM",
  "1º BIESP","1º BPTRAN","2ª EMG","2º BIESP","ACGPM","AECI","AG PM",
  "BEPI","BOPE","BPCHOQUE","BPGD","BPRP","BPRV","CAS-PM","CAMIL","CEC",
  "CEFD","CEMATA","CEMET","CFARM","CG-GI","CGPM","CIATUR","CIMUS",
  "CIOE","CIPCÃES","CIPMOTO","CIPOMA","CJD","CMH","CMT GERALCODONTO",
  "CORGER","CPA","CPM/DGP","CPO","CPP","CREED","CRESEP","CSM/NT",
  "CSM/MB","CTT","DAL/CSM/MOTO","DAL PM","DASDH","DASIS","DEAJA",
  "DEIP","DF","DGA","DGP-2","DGP-3","DGP-4","DGP-5","DGP-6","DGP-7",
  "DGP-8","DGP-8-CARTORIAL","DGP-8-CORREICIONAL","DGP-9","DGP-AJUDANCIA",
  "DIM","DIM-SC","DIM-SC2","DINTER I","DINTER II","DIP","DIRESP",
  "DPJM","DPO","DPO-SEFAZ","DS","DTEC","EMG","GP","GTA","OLS",
  "RESERVA PM","RPMON","SCG PM","SECOR-DINTER I"
];

export const UNIDADES_BM = [
  "1º GB","2º GB","3º GB","4º GB","5º GB","6º GB","7º GB","8º GB",
  "9º GB","10º GB","AJS","CAC","CAS-BM","CAT AGRESTE","CAT-AGRESTE II",
  "CAT-AGRESTE III","CAT RMR","CAT SERTÃO I","CAT SERTÃO II",
  "CAT SERTÃO III","CAT SERTÃO IV","CAT SERTÃO V","CAT SERTÃO VI",
  "CAT ZONA DA MATA","CAT ZONA DA MATA II","CCI","CCO","CCS","CEAO",
  "CEFD","CEMET II","CG-GI","CGBM","CGFIN","CINT","CJD","CMAN",
  "COESP","COINTER-1","COINTER-2","COM","CORGER","CPLAG","CTIC",
  "DAL BM","DDIR","DEIP","DGO","DGP-SCP","DGP-CBMPE","DGP-SCO",
  "DGP/CBMPE","DIESP","DINTER I","DINTER II","DIP","DJD"
];

export const LOTACOES_CIRC_DESEC = [
  // CIRC
  ...Array.from({length: 220}, (_, i) => `${String(i+1).padStart(3, '0')}ª CIRC`),
  // DESEC
  ...Array.from({length: 26}, (_, i) => `${String(i+1).padStart(2, '0')}ª DESEC`),
  // DP Mulher
  ...Array.from({length: 16}, (_, i) => `${i+1}ª DP Mulher`),
  // Extras
  "11ª SEC GOIANA","13ª DPLAN DPCRIA","16ª DPH-GOIANA","17ª DPH-VITÓRIA",
  "18ª DPH-PALMARES","19ª DPH-CARUARU","19ª DPPLAN-JABOATÃO","1ª SEC-BOA VISTA",
  "1ª DPRN","20ª DPH-CARUARU","21ª DPH-SANTA CRUZ","22ª DPH-GARANHUNS",
  "2ª DP CAIC","2ª DPRN","2ª DPH","3ª DPH-AGRESTE","3ª DPRN","3ª DPH",
  "4ª DPH","5ª DPH","7ª DPMUL-SURUBIM","7ª DPPLAN-GPCA","APOSENTADO-PC",
  "CEPLANC","COORDEPLAN","COORDPPOL","CORE","CORGER","CPCE-1","CPCE-2",
  "CPCE-3","CPCE-4","DDPP","DECASP","DECCOT","DENARC","DEPATRI","DEPRIM",
  "DHMN","DHPP","DIAG","DIM-PC","DIMAVE","DINTEL","DINTER-1 PC",
  "DINTER-2 PC","DIRESP-PC","DIRH","DIVASP","DP CONSUMIDOR","DP JABOATÃO",
  "DPAI","DPCA","DPCRIA","DPDT","DPH","DPID","DPMUL","DPPH","DPRE",
  "DPRFC","DPRFV","DPTUR","DRACCO","DTI","FTC DHPP","GCOE","GCOI2",
  "GDIM-PC","GDINTER-1 PC","GDINTER-2 PC","GEPCA","GOE","GRESP-PC",
  "IITB","NUPREV","P-ID AGUAS BELAS","P-ID PESQUEIRA","PAULISTA",
  "PETROLINA","PLANT","POLINTER","SDS","UNEATEM","UNIMOPE","UNIOPE",
  "UNIPA","UNIPRAI","UNIPRECA","UNISERG","UNISUT","UPREM","UTA-IITB"
];

export const CARGOS_CIRC_DESEC = [
  "DPC","APC","EPC","PAPILOSCOPISTA","ASSISTENTE DE GESTÃO PUBLICA",
  "IDENTIFICADOR CIVIL E CRIMINAL"
];

export const UNIDADES_EXTRAS = [
  "ALEPE","CAMIL-CAD","CAMIL-CHEFIA","CAMIL-CINT","CAMIL-CODECIPE",
  "CAMIL-CSI","CAMIL-CTEA","CAMIL-DAF","CAMIL-DSI","CAMIL-GAJ",
  "CONTROLADORIA-GESTÃO CONTROLADORIA","CORGER","MPPE-CGPC","SDS",
  "SDS-GTA","SEAP","TJPE-APMC"
];

export const UNIDADES_PERICIA = [
  "DIRH-PCIE","DIRH PCIE","GICPAS","IC","IML","IMLAPC",
  "URPOC-NAZARÉ DA MATA","URPOC-AFOGADOS DA INGAZERA","URPOC-ARCOVERDE",
  "URPOC-CARUARU","URPOC-OURICURI","URPOC-PALMARES","URPOC-PETROLINA"
];

export const CARGOS_PERICIA = [
  "PERITO CRIMINAL","MEDICO LEGISTA","AGENTE DE PERICIA CRIMINAL",
  "AGENTE DE MEDICINA LEGAL","AUXILIAR GESTAO PUBLICA",
  "ASSISTENTE GESTAO PUBLICA"
];

// Diligências
export const DILIGENCIAS = [
  { id: 'atestado_medico', label: 'Atestado Médico' },
  { id: 'bo_pcpe', label: 'BO PCPE' },
  { id: 'contato_whatsapp', label: 'Contato por WhatsApp' },
  { id: 'contato_telefonico', label: 'Contato Telefônico' },
  { id: 'email', label: 'E-mail' },
  { id: 'escala_servico', label: 'Escala de Serviço' },
  { id: 'extrato_certidao_conjunta', label: 'Extrato Certidão Conjunta PM/PC' },
  { id: 'extrato_cadastro_civil', label: 'Extrato do Cadastro Civil' },
  { id: 'extrato_infopol', label: 'Extrato INFOPOL' },
  { id: 'extrato_infoseg', label: 'Extrato INFOSEG' },
  { id: 'extrato_mppe', label: 'Extrato MPPE' },
  { id: 'extrato_tjpe', label: 'Extrato TJPE' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'laudo_medico', label: 'Laudo Médico' },
  { id: 'laudo_pericial_iml_positivo', label: 'Laudo Pericial - IML - Laudo Positivo' },
  { id: 'laudo_pericial_iml_negativo', label: 'Laudo Pericial - IML - Negativo' },
  { id: 'mapa_lancamento_viaturas', label: 'Mapa de Lançamento de Viaturas' },
  { id: 'ouvida_testemunha', label: 'Ouvida da Testemunha' },
  { id: 'ouvida_vitima', label: 'Ouvida da Vítima' },
  { id: 'ouvida_investigado', label: 'Ouvida do Investigado' },
  { id: 'ouvida_sindicado', label: 'Ouvida do Sindicado' },
  { id: 'rastreamento_viaturas_com_registro', label: 'Rastreamento de Viaturas - Com Registro' },
  { id: 'rastreamento_viaturas_sem_registro', label: 'Rastreamento de Viaturas - Sem Registro' },
  { id: 'sgpm', label: 'SGPM' },
  { id: 'sigpad_fato_apuração_outra_unidade', label: 'SIGPAD - Fato em Apuração por Outra Unidade' },
  { id: 'sigpad_fato_ja_apurado', label: 'SIGPAD - Fato Já Apurado' },
  { id: 'sigpad_nada_consta', label: 'SIGPAD - Nada Consta' },
  { id: 'videos', label: 'Vídeos' }
];

// Cores para gráficos
export const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
]; 