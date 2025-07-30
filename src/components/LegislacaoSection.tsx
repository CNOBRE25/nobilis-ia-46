
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Scale, 
  Shield, 
  Building, 
  Users, 
  Gavel,
  Download,
  ExternalLink,
  Calendar,
  Tag,
  AlertTriangle,
  Award,
  Copy
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeiItem {
  id: string;
  numero: string;
  ano: string;
  titulo: string;
  ementa: string;
  categoria: string;
  dataPublicacao: string;
  status: "vigente" | "revogada" | "suspensa";
  link?: string;
  artigos?: string[];
}

interface CrimeMapping {
  crime: string;
  artigo: string;
  descricao: string;
  pena: string;
}

interface CrimeMilitar {
  crime: string;
  artigo: string;
  descricao: string;
  pena: string;
  categoria: string;
  observacoes: string;
}

interface LeiMilitar {
  id: string;
  numero: string;
  ano: string;
  titulo: string;
  ementa: string;
  categoria: string;
  dataPublicacao: string;
  status: string;
  orgao: string;
  artigos?: string[];
  link?: string;
}

interface LegislacaoMilitarData {
  leis: LeiMilitar[];
  crimes_militares: CrimeMilitar[];
  regulamentos_pe: unknown[];
  jurisprudencia: unknown[];
}

const crimesMapping: CrimeMapping[] = [
  {
    crime: "homicídio",
    artigo: "121",
    descricao: "Matar alguém",
    pena: "reclusão, de seis a vinte anos"
  },
  {
    crime: "furto",
    artigo: "155",
    descricao: "Subtrair, para si ou para outrem, coisa alheia móvel",
    pena: "reclusão de um a quatro anos, e multa"
  },
  {
    crime: "roubo",
    artigo: "157",
    descricao: "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência",
    pena: "reclusão de quatro a dez anos, e multa"
  },
  {
    crime: "estelionato",
    artigo: "171",
    descricao: "Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro",
    pena: "reclusão de um a cinco anos, e multa"
  },
  {
    crime: "lesão corporal",
    artigo: "129",
    descricao: "Ofender a integridade corporal ou a saúde de outrem",
    pena: "detenção de três meses a um ano"
  },
  {
    crime: "injúria",
    artigo: "140",
    descricao: "Injuriar alguém, ofendendo-lhe a dignidade ou o decoro",
    pena: "detenção de um a seis meses, ou multa"
  },
  {
    crime: "calúnia",
    artigo: "138",
    descricao: "Caluniar alguém, imputando-lhe falsamente fato definido como crime",
    pena: "detenção de seis meses a dois anos, e multa"
  },
  {
    crime: "difamação",
    artigo: "139",
    descricao: "Difamar alguém, imputando-lhe fato ofensivo à sua reputação",
    pena: "detenção de três meses a um ano, e multa"
  },
  {
    crime: "tráfico de drogas",
    artigo: "33",
    descricao: "Importar, exportar, remeter, preparar, produzir, fabricar, adquirir, vender, expor à venda, oferecer, ter em depósito, transportar, trazer consigo, guardar, prescrever, ministrar, entregar a consumo ou fornecer drogas",
    pena: "reclusão de 5 (cinco) a 15 (quinze) anos e pagamento de 500 (quinhentos) a 1.500 (mil e quinhentos) dias-multa"
  },
  {
    crime: "estupro",
    artigo: "213",
    descricao: "Constranger alguém, mediante violência ou grave ameaça, a ter conjunção carnal ou a praticar ou permitir que com ele se pratique outro ato libidinoso",
    pena: "reclusão de 6 (seis) a 10 (dez) anos"
  }
];

const mockLeis: LeiItem[] = [
  // CONSTITUIÇÃO
  {
    id: "const-1",
    numero: "Constituição",
    ano: "1988",
    titulo: "Constituição da República Federativa do Brasil",
    ementa: "Constituição Federal promulgada em 5 de outubro de 1988.",
    categoria: "Constituição",
    dataPublicacao: "1988-10-05",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
  },

  // LEGISLAÇÃO PENAL E PROCESSO PENAL NACIONAL
  {
    id: "penal-1",
    numero: "2.848",
    ano: "1940",
    titulo: "Código Penal",
    ementa: "Decreto-Lei que institui o Código Penal Brasileiro.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1940-12-07",
    status: "vigente",
    artigos: ["121", "129", "138", "139", "140", "155", "157", "171", "213"],
    link: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm"
  },
  {
    id: "penal-2",
    numero: "12.234",
    ano: "2010",
    titulo: "Alteração da Prescrição Penal no CP",
    ementa: "Altera dispositivos do Código Penal relativos à prescrição penal.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2010-05-04",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12234.htm"
  },
  {
    id: "penal-3",
    numero: "3.689",
    ano: "1941",
    titulo: "Código de Processo Penal",
    ementa: "Decreto-Lei que institui o Código de Processo Penal Brasileiro.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1941-10-03",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm"
  },
  {
    id: "penal-4",
    numero: "12.403",
    ano: "2011",
    titulo: "Reforma da Prisão Processual, Fiança e Medidas Cautelares",
    ementa: "Altera dispositivos do Código de Processo Penal relativos à prisão, fiança, liberdade provisória e medidas cautelares.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2011-05-04",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2011/lei/l12403.htm"
  },

  // CÓDIGOS CIVIL E PROCESSO CIVIL
  {
    id: "civil-1",
    numero: "10.406",
    ano: "2002",
    titulo: "Novo Código Civil",
    ementa: "Institui o Código Civil Brasileiro.",
    categoria: "Códigos Civil e Processo Civil",
    dataPublicacao: "2002-01-10",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm"
  },
  {
    id: "civil-2",
    numero: "13.105",
    ano: "2015",
    titulo: "Novo Código de Processo Civil",
    ementa: "Institui o Código de Processo Civil (vigência 18/03/2016).",
    categoria: "Códigos Civil e Processo Civil",
    dataPublicacao: "2015-03-16",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm"
  },

  // CARREIRA E ESTATUTOS FUNCIONAIS (UNIÃO)
  {
    id: "carreira-1",
    numero: "8.112",
    ano: "1990",
    titulo: "Estatuto dos Servidores Públicos da União",
    ementa: "Lei que dispõe sobre o regime jurídico dos servidores públicos civis da União.",
    categoria: "Carreira e Estatutos Funcionais",
    dataPublicacao: "1990-12-11",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm"
  },

  // ARMAS E INSTRUMENTOS DE SEGURANÇA PÚBLICA
  {
    id: "armas-1",
    numero: "10.826",
    ano: "2003",
    titulo: "Estatuto do Desarmamento",
    ementa: "Dispõe sobre registro, posse e comercialização de armas de fogo e munição.",
    categoria: "Armas e Instrumentos de Segurança",
    dataPublicacao: "2003-12-22",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm"
  },
  {
    id: "armas-2",
    numero: "5.123",
    ano: "2004",
    titulo: "Regulamentação do Estatuto do Desarmamento",
    ementa: "Decreto que regulamenta o Estatuto do Desarmamento.",
    categoria: "Armas e Instrumentos de Segurança",
    dataPublicacao: "2004-07-01",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5123.htm"
  },
  {
    id: "armas-3",
    numero: "13.060",
    ano: "2014",
    titulo: "Uso de Instrumentos de Menor Potencial Ofensivo",
    ementa: "Lei que dispõe sobre o uso de instrumentos de menor potencial ofensivo.",
    categoria: "Armas e Instrumentos de Segurança",
    dataPublicacao: "2014-12-22",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13060.htm"
  },
  {
    id: "armas-4",
    numero: "12.993",
    ano: "2014",
    titulo: "Porte Funcional de Arma",
    ementa: "Lei que dispõe sobre porte funcional de arma.",
    categoria: "Armas e Instrumentos de Segurança",
    dataPublicacao: "2014-06-17",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12993.htm"
  },

  // PROCESSO ADMINISTRATIVO E IMPROBIDADE (UNIÃO)
  {
    id: "admin-1",
    numero: "9.784",
    ano: "1999",
    titulo: "Processo Administrativo Público",
    ementa: "Lei Federal que dispõe sobre processo administrativo público.",
    categoria: "Processo Administrativo e Improbidade",
    dataPublicacao: "1999-01-29",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9784.htm"
  },

  // ORDEM DOS ADVOGADOS
  {
    id: "oab-1",
    numero: "8.906",
    ano: "1994",
    titulo: "Estatuto da OAB",
    ementa: "Lei que dispõe sobre o Estatuto da Ordem dos Advogados do Brasil.",
    categoria: "Ordem dos Advogados",
    dataPublicacao: "1994-07-04",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l8906.htm"
  },

  // ORGANIZAÇÃO CRIMINOSA E INVESTIGAÇÃO
  {
    id: "org-crim-1",
    numero: "12.850",
    ano: "2013",
    titulo: "Organização Criminosa",
    ementa: "Lei que define organização criminosa e dispõe sobre investigação criminal.",
    categoria: "Organização Criminosa e Investigação",
    dataPublicacao: "2013-08-02",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12850.htm"
  },
  {
    id: "org-crim-2",
    numero: "12.830",
    ano: "2013",
    titulo: "Investigação Criminal por Delegado",
    ementa: "Lei que dispõe sobre investigação criminal por delegado.",
    categoria: "Organização Criminosa e Investigação",
    dataPublicacao: "2013-06-20",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12830.htm"
  },

  // LEIS PENAIS ESPECÍFICAS
  {
    id: "penal-5",
    numero: "3.688",
    ano: "1941",
    titulo: "Lei das Contravenções Penais",
    ementa: "Decreto-Lei que define as contravenções penais no Brasil.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1941-10-03",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3688.htm"
  },
  {
    id: "penal-6",
    numero: "7.210",
    ano: "1984",
    titulo: "Lei de Execução Penal (LEP)",
    ementa: "Estabelece normas para a execução penal no Brasil.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1984-07-11",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l7210.htm"
  },
  {
    id: "penal-7",
    numero: "8.072",
    ano: "1990",
    titulo: "Lei dos Crimes Hediondos",
    ementa: "Define crimes hediondos e regula seu tratamento penal.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1990-07-25",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l8072.htm"
  },
  {
    id: "penal-8",
    numero: "9.613",
    ano: "1998",
    titulo: "Lei de Lavagem de Dinheiro",
    ementa: "Dispõe sobre os crimes de lavagem de dinheiro.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1998-03-03",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9613.htm"
  },
  {
    id: "penal-9",
    numero: "9.455",
    ano: "1997",
    titulo: "Lei da Tortura",
    ementa: "Define os crimes de tortura e dá outras providências.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1997-04-07",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9455.htm"
  },
  {
    id: "penal-10",
    numero: "9.296",
    ano: "1996",
    titulo: "Lei de Interceptação Telefônica",
    ementa: "Regula a interceptação de comunicações telefônicas.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1996-07-24",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9296.htm"
  },
  {
    id: "penal-11",
    numero: "11.340",
    ano: "2006",
    titulo: "Lei Maria da Penha",
    ementa: "Cria mecanismos para coibir a violência doméstica e familiar contra a mulher.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2006-08-07",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm"
  },
  {
    id: "penal-12",
    numero: "11.343",
    ano: "2006",
    titulo: "Lei de Drogas",
    ementa: "Institui o Sistema Nacional de Políticas Públicas sobre Drogas - Sisnad; prescreve medidas para prevenção do uso indevido, atenção e reinserção social de usuários e dependentes de drogas.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2006-08-23",
    status: "vigente",
    artigos: ["33"],
    link: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm"
  },
  {
    id: "penal-13",
    numero: "12.737",
    ano: "2012",
    titulo: "Lei dos Crimes Cibernéticos (Lei Carolina Dieckmann)",
    ementa: "Tipifica crimes informáticos e altera o Código Penal.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2012-11-30",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12737.htm"
  },
  {
    id: "penal-14",
    numero: "13.104",
    ano: "2015",
    titulo: "Lei do Crime de Feminicídio",
    ementa: "Altera o Código Penal para prever o feminicídio como circunstância qualificadora do homicídio.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2015-03-09",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13104.htm"
  },
  {
    id: "penal-15",
    numero: "12.037",
    ano: "2009",
    titulo: "Lei de Identificação Criminal",
    ementa: "Dispõe sobre a identificação criminal do civilmente identificado.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2009-10-01",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12037.htm"
  },
  {
    id: "penal-16",
    numero: "13.869",
    ano: "2019",
    titulo: "Lei de Abuso de Autoridade",
    ementa: "Define os crimes de abuso de autoridade.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2019-09-05",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13869.htm"
  },
  {
    id: "penal-17",
    numero: "13.718",
    ano: "2018",
    titulo: "Lei de Importunação Sexual e Registro Não Consentido",
    ementa: "Altera o Código Penal para tipificar os crimes de importunação sexual e divulgação de cena de estupro.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2018-09-24",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13718.htm"
  },
  {
    id: "penal-18",
    numero: "14.155",
    ano: "2021",
    titulo: "Lei do Estelionato Eletrônico e Violação de Dispositivo Informático",
    ementa: "Altera o Código Penal para prever o estelionato eletrônico e a violação de dispositivo informático.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2021-05-28",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14155.htm"
  },
  {
    id: "penal-19",
    numero: "14.132",
    ano: "2021",
    titulo: "Lei do Stalking (Perseguição)",
    ementa: "Tipifica o crime de perseguição (stalking).",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2021-03-31",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14132.htm"
  },
  {
    id: "penal-20",
    numero: "14.321",
    ano: "2022",
    titulo: "Lei da Violência Institucional",
    ementa: "Dispõe sobre a prevenção e o combate à violência institucional.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2022-04-01",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14321.htm"
  },
  {
    id: "penal-21",
    numero: "9.807",
    ano: "1999",
    titulo: "Lei de Proteção à Vítima e Testemunha",
    ementa: "Estabelece normas para a proteção de vítimas e testemunhas ameaçadas.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1999-07-13",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9807.htm"
  },
  {
    id: "penal-22",
    numero: "12.846",
    ano: "2013",
    titulo: "Lei Anticorrupção Empresarial",
    ementa: "Dispõe sobre a responsabilização administrativa e civil de pessoas jurídicas pela prática de atos contra a administração pública.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2013-08-01",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12846.htm"
  },
  {
    id: "penal-23",
    numero: "12.318",
    ano: "2010",
    titulo: "Lei da Alienação Parental (com reflexo criminal)",
    ementa: "Dispõe sobre a alienação parental e altera o art. 236 da Lei nº 8.069/90.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2010-08-26",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12318.htm"
  },
  {
    id: "penal-24",
    numero: "14.197",
    ano: "2021",
    titulo: "Lei de Crimes contra o Estado Democrático de Direito",
    ementa: "Define crimes contra o Estado Democrático de Direito.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2021-09-01",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14197.htm"
  },
  {
    id: "penal-25",
    numero: "9.605",
    ano: "1998",
    titulo: "Lei de Crimes Ambientais",
    ementa: "Dispõe sobre as sanções penais e administrativas derivadas de condutas e atividades lesivas ao meio ambiente.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1998-02-13",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9605.htm"
  },
  {
    id: "penal-26",
    numero: "9.099",
    ano: "1995",
    titulo: "Lei dos Juizados Especiais Criminais (Lei dos JECrim)",
    ementa: "Dispõe sobre os Juizados Especiais Cíveis e Criminais.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1995-09-26",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l9099.htm"
  },
  {
    id: "penal-27",
    numero: "7.716",
    ano: "1989",
    titulo: "Lei de Racismo e Discriminação Racial",
    ementa: "Define os crimes resultantes de preconceito de raça ou de cor.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "1989-01-05",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l7716.htm"
  },
  {
    id: "penal-28",
    numero: "12.015",
    ano: "2009",
    titulo: "Lei de Crimes contra a Dignidade Sexual",
    ementa: "Altera o Código Penal para dispor sobre os crimes contra a dignidade sexual.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2009-08-07",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12015.htm"
  },
  {
    id: "penal-29",
    numero: "13.709",
    ano: "2018",
    titulo: "Lei Geral de Proteção de Dados (LGPD)",
    ementa: "Dispõe sobre a proteção de dados pessoais e altera a Lei nº 12.965, de 23 de abril de 2014 (Marco Civil da Internet).",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2018-08-14",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
  },
  {
    id: "penal-30",
    numero: "13.260",
    ano: "2016",
    titulo: "Lei Antiterrorismo",
    ementa: "Define crimes de terrorismo e dispõe sobre investigação criminal.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2016-03-16",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13260.htm"
  },
  {
    id: "penal-31",
    numero: "13.964",
    ano: "2019",
    titulo: "Pacote Anticrime (Lei do Juízo de Garantias)",
    ementa: "Altera o Código Penal, o Código de Processo Penal e outras leis para modificar o sistema de execução penal e o regime de cumprimento de pena.",
    categoria: "Legislação Penal e Processo Penal",
    dataPublicacao: "2019-12-24",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13964.htm"
  },

  // DIREITOS HUMANOS E PROTEÇÃO
  {
    id: "direitos-1",
    numero: "8.069",
    ano: "1990",
    titulo: "Estatuto da Criança e do Adolescente (ECA)",
    ementa: "Dispõe sobre a proteção integral à criança e ao adolescente.",
    categoria: "Direitos Humanos e Proteção",
    dataPublicacao: "1990-07-13",
    status: "vigente",
    link: "https://www.planalto.gov.br/ccivil_03/leis/l8069.htm"
  }
];

const categorias = [
  { value: "todas", label: "Todas as Categorias", icon: BookOpen },
  { value: "constituicao", label: "Constituição", icon: Scale },
  { value: "penal", label: "Legislação Penal e Processo Penal", icon: Gavel },
  { value: "civil", label: "Códigos Civil e Processo Civil", icon: Building },
  { value: "carreira", label: "Carreira e Estatutos Funcionais", icon: Users },
  { value: "armas", label: "Armas e Instrumentos de Segurança", icon: AlertTriangle },
  { value: "administrativo", label: "Processo Administrativo e Improbidade", icon: Building },
  { value: "oab", label: "Ordem dos Advogados", icon: Scale },
  { value: "organizacao-criminosa", label: "Organização Criminosa e Investigação", icon: AlertTriangle },
  { value: "direitos-humanos", label: "Direitos Humanos e Proteção", icon: Shield }
];

// Função utilitária para prescrição penal comum (art. 109 CP)
function getPrescricaoPenal(artigo: string, pena: string): string {
  // Tabela simplificada baseada no art. 109 do CP
  // (Apenas exemplos, pode ser refinado)
  const anos = [
    { limite: 2, prescricao: '4 anos' },
    { limite: 4, prescricao: '8 anos' },
    { limite: 8, prescricao: '12 anos' },
    { limite: 12, prescricao: '16 anos' },
    { limite: 20, prescricao: '20 anos' },
    { limite: 100, prescricao: '20 anos' },
  ];
  const match = pena.match(/(\d+)/g);
  if (!match) return 'Não informado';
  const maxPena = Math.max(...match.map(Number));
  const found = anos.find(a => maxPena <= a.limite);
  return found ? found.prescricao : 'Não informado';
}

// Função utilitária para prescrição penal militar (art. 125 CPM)
function getPrescricaoMilitar(pena: string): string {
  // Tabela simplificada baseada no art. 125 do CPM
  const anos = [
    { limite: 1, prescricao: '2 anos' },
    { limite: 2, prescricao: '4 anos' },
    { limite: 4, prescricao: '8 anos' },
    { limite: 8, prescricao: '12 anos' },
    { limite: 12, prescricao: '16 anos' },
    { limite: 20, prescricao: '20 anos' },
    { limite: 100, prescricao: '20 anos' },
  ];
  const match = pena.match(/(\d+)/g);
  if (!match) return 'Não informado';
  const maxPena = Math.max(...match.map(Number));
  const found = anos.find(a => maxPena <= a.limite);
  return found ? found.prescricao : 'Não informado';
}

const LegislacaoSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermMilitar, setSearchTermMilitar] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedStatus, setSelectedStatus] = useState("todas");
  const [selectedStatusMilitar, setSelectedStatusMilitar] = useState("todas");
  const [filteredLeis, setFilteredLeis] = useState(mockLeis);
  const [crimeResults, setCrimeResults] = useState<CrimeMapping[]>([]);
  const [crimeResultsMilitares, setCrimeResultsMilitares] = useState<CrimeMilitar[]>([]);
  const [legislacaoMilitar, setLegislacaoMilitar] = useState<LegislacaoMilitarData | null>(null);
  const [filteredLeisMilitares, setFilteredLeisMilitares] = useState<LeiMilitar[]>([]);
  const [filteredCrimesMilitares, setFilteredCrimesMilitares] = useState<CrimeMilitar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    const loadLegislacaoMilitar = async () => {
      try {
        setLoading(true);
        const response = await fetch('/leis_crimes_militares_pe.json');
        const data: LegislacaoMilitarData = await response.json();
        setLegislacaoMilitar(data);
        setFilteredLeisMilitares(data.leis);
        setFilteredCrimesMilitares(data.crimes_militares);
      } catch (error) {
        if (import.meta.env.DEV) {
        console.error('Erro ao carregar legislação militar:', error);
        }
        setError('Erro ao carregar legislação militar');
      } finally {
        setLoading(false);
      }
    };

    loadLegislacaoMilitar();
  }, []);

  // Executa busca militar quando os termos mudam
  useEffect(() => {
    handleSearchMilitar();
  }, [searchTermMilitar, selectedStatusMilitar, legislacaoMilitar, handleSearchMilitar]);

  // Executa busca unificada quando o termo de busca geral mudar
  useEffect(() => {
    if (searchTerm) {
      searchAllCrimes(searchTerm);
    } else {
      setCrimeResults([]);
      setCrimeResultsMilitares([]);
    }
  }, [searchTerm, legislacaoMilitar, searchAllCrimes]);

  const handleSearch = () => {
    let filtered = mockLeis;

    // Buscar crimes (comuns e militares) se houver termo de busca
    if (searchTerm) {
      searchAllCrimes(searchTerm);
    } else {
      setCrimeResults([]);
      setCrimeResultsMilitares([]);
    }

    // Filtro normal de leis
    if (searchTerm) {
      filtered = filtered.filter(lei => 
        lei.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lei.ementa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lei.numero.includes(searchTerm)
      );
    }

    if (selectedCategory !== "todas") {
      filtered = filtered.filter(lei => 
        lei.categoria.toLowerCase().includes(selectedCategory.replace("-", " "))
      );
    }

    if (selectedStatus !== "todas") {
      filtered = filtered.filter(lei => lei.status === selectedStatus);
    }

    setFilteredLeis(filtered);
  };

  const handleSearchMilitar = () => {
    if (!legislacaoMilitar) return;

    let filteredLeis = legislacaoMilitar.leis;
    let filteredCrimes = legislacaoMilitar.crimes_militares;

    // Busca por crimes militares
    if (searchTermMilitar) {
      filteredCrimes = legislacaoMilitar.crimes_militares.filter(crime =>
        crime.crime.toLowerCase().includes(searchTermMilitar.toLowerCase()) ||
        crime.descricao.toLowerCase().includes(searchTermMilitar.toLowerCase()) ||
        crime.artigo.toLowerCase().includes(searchTermMilitar.toLowerCase())
      );
    }

    // Busca por leis militares
    if (searchTermMilitar) {
      filteredLeis = legislacaoMilitar.leis.filter(lei => 
        lei.titulo.toLowerCase().includes(searchTermMilitar.toLowerCase()) ||
        lei.ementa.toLowerCase().includes(searchTermMilitar.toLowerCase()) ||
        lei.numero.toLowerCase().includes(searchTermMilitar.toLowerCase())
      );
    }

    // Filtro por status
    if (selectedStatusMilitar !== "todas") {
      filteredLeis = filteredLeis.filter(lei => lei.status === selectedStatusMilitar);
    }

    setFilteredLeisMilitares(filteredLeis);
    setFilteredCrimesMilitares(filteredCrimes);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vigente": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "revogada": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "suspensa": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleLinkClick = (url: string, leiTitle: string) => {
    try {
      // Verifica se a URL é válida
      const urlObj = new URL(url);
      
      // Tenta abrir o link silenciosamente
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      // Se a URL for inválida, não faz nada
      console.warn('URL inválida:', url);
    }
  };

  const handleCopyLink = async (url: string, leiTitle: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert(`Link copiado para a área de transferência!\n\nLei: ${leiTitle}\nURL: ${url}`);
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Link copiado para a área de transferência!\n\nLei: ${leiTitle}\nURL: ${url}`);
    }
  };

  // Função para abrir o Código Penal Militar no artigo específico
  const openCPMArticle = (artigo: string) => {
    // Extrair número do artigo (ex: "187 CPM" -> "187")
    const artigoNumero = artigo.replace(/\s*CPM.*/, '').trim();
    const cpmUrl = "https://www.planalto.gov.br/ccivil_03/decreto-lei/del1001.htm";
    try {
      window.open(cpmUrl, '_blank', 'noopener,noreferrer');
      // Mostrar alerta informativo sobre o artigo
      alert(`Redirecionando para o Código Penal Militar (Decreto-Lei nº 1.001/1969)\n\nArtigo ${artigoNumero} - Consulte o texto completo para tipificação e prescrição.\n\nObservação: A prescrição militar segue o art. 125 do CPM, que possui prazos diferentes do Código Penal comum.`);
    } catch (error) {
      console.warn('Erro ao abrir CPM:', error);
    }
  };

  // Função para buscar crimes militares
  const searchAndShowCrimesMilitares = () => {
    if (!searchTermMilitar.trim()) {
      alert('Digite um termo para buscar crimes militares.');
      return;
    }

    const crimesEncontrados = searchCrimesMilitares(searchTermMilitar);
    setFilteredCrimesMilitares(crimesEncontrados);
  };

  // Função unificada para buscar crimes (comuns e militares)
  const searchAllCrimes = (termo: string) => {
    if (!termo.trim()) return;

    const termoLower = termo.toLowerCase().trim();
    let crimesComuns: CrimeMapping[] = [];
    let crimesMilitares: CrimeMilitar[] = [];

    // Buscar crimes comuns
    crimesComuns = crimesMapping.filter(crime => {
      // Busca por nome do crime
      if (crime.crime.toLowerCase().includes(termoLower)) return true;
      
      // Busca por artigo (permite busca por número)
      if (crime.artigo.includes(termo)) return true;
      
      // Busca por descrição
      if (crime.descricao.toLowerCase().includes(termoLower)) return true;
      
      return false;
    });

    // Buscar crimes militares
    if (legislacaoMilitar) {
      crimesMilitares = searchCrimesMilitares(termo);
    }

    setCrimeResults(crimesComuns);
    setCrimeResultsMilitares(crimesMilitares);
  };

  // Função para calcular prescrição militar específica
  const calculatePrescricaoMilitar = (artigo: string, pena: string): string => {
    // Extrair anos da pena
    const anosMatch = pena.match(/(\d+)/g);
    if (!anosMatch) return 'Não informado';
    
    const maxAnos = Math.max(...anosMatch.map(Number));
    
    // Tabela de prescrição militar baseada no art. 125 do CPM
    if (maxAnos <= 1) return '2 anos';
    if (maxAnos <= 2) return '4 anos';
    if (maxAnos <= 4) return '8 anos';
    if (maxAnos <= 8) return '12 anos';
    if (maxAnos <= 12) return '16 anos';
    if (maxAnos <= 20) return '20 anos';
    return '20 anos';
  };

  // Função para buscar crimes militares específicos
  const searchCrimesMilitares = (termo: string) => {
    if (!legislacaoMilitar) return [];
    
    const termoLower = termo.toLowerCase().trim();
    
    return legislacaoMilitar.crimes_militares.filter(crime => {
      // Busca por nome do crime
      if (crime.crime.toLowerCase().includes(termoLower)) return true;
      
      // Busca por artigo (permite busca por número)
      if (crime.artigo.toLowerCase().includes(termoLower)) return true;
      
      // Busca por descrição
      if (crime.descricao.toLowerCase().includes(termoLower)) return true;
      
      // Busca por categoria
      if (crime.categoria.toLowerCase().includes(termoLower)) return true;
      
      // Busca por observações
      if (crime.observacoes && crime.observacoes.toLowerCase().includes(termoLower)) return true;
      
      // Busca por palavras-chave na pena
      if (crime.pena.toLowerCase().includes(termoLower)) return true;
      
      return false;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-card-foreground">
                Consulta de Legislação Brasileira
              </CardTitle>
              <CardDescription>
                Sistema seguro para consulta e pesquisa de leis, decretos e normas vigentes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="geral" className="flex items-center">
            <Scale className="h-4 w-4 mr-2" />
            Legislação Geral
          </TabsTrigger>
          <TabsTrigger value="militar" className="flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Legislação Militar PE
          </TabsTrigger>
          <TabsTrigger value="crimes-militares" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Crimes Militares
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          {/* Filtros de Busca */}
          <Card className="ai-card">
            <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por crime, número, título ou conteúdo da lei..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleSearch} className="ai-button-primary">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categorias.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="todas">Todos os Status</SelectItem>
                    <SelectItem value="vigente">Vigente</SelectItem>
                    <SelectItem value="revogada">Revogada</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de Crimes */}
      {(crimeResults.length > 0 || crimeResultsMilitares.length > 0) && (
        <Card className="ai-card border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg text-blue-400">
                Crimes Encontrados
              </CardTitle>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {crimeResults.length + crimeResultsMilitares.length} resultado(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crimeResults.map((crime, index) => (
                <Card key={index} className="ai-card border-blue-500/20">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-blue-400">
                              {crime.crime.toUpperCase()} (Penal Comum)
                            </h3>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Art. {crime.artigo} - CP
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-card-foreground">
                            {crime.descricao}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-semibold text-blue-400">PENA:</span>
                        </div>
                        <p className="text-sm text-blue-300">
                          {crime.pena}
                        </p>
                        <div className="mt-2 text-xs text-blue-400">
                          Prescrição (art. 109 CP): <strong>{getPrescricaoPenal(crime.artigo, crime.pena)}</strong>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {crimeResultsMilitares.map((crime, index) => (
                <Card key={index} className="ai-card border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-red-400">
                              {crime.crime.toUpperCase()} (Penal Militar)
                            </h3>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {crime.artigo} - CPM
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-card-foreground">
                            {crime.descricao}
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-red-400" />
                          <span className="text-sm font-semibold text-red-400">PENA:</span>
                        </div>
                        <p className="text-sm text-red-300">{crime.pena}</p>
                        <div className="mt-2 text-xs text-red-400">
                          Prescrição (art. 125 CPM): <strong>{getPrescricaoMilitar(crime.pena)}</strong>
                        </div>
                        {crime.observacoes && (
                          <div className="mt-2 text-xs text-muted-foreground italic">{crime.observacoes}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-card-foreground">
              Resultados da Busca
            </CardTitle>
            <Badge variant="outline" className="bg-card text-card-foreground border-border">
              {filteredLeis.length} lei(s) encontrada(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4">
              {filteredLeis.map((lei) => (
                <Card key={lei.id} className="ai-card border border-border/60">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">
                              Lei nº {lei.numero}/{lei.ano}
                            </h3>
                            <Badge className={getStatusColor(lei.status)}>
                              {lei.status.charAt(0).toUpperCase() + lei.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {lei.titulo}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {lei.link && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ai-button-secondary"
                                onClick={() => handleLinkClick(lei.link!, lei.titulo)}
                                title="Abrir Lei"
                              >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ai-button-secondary"
                                onClick={() => handleCopyLink(lei.link!, lei.titulo)}
                                title="Copiar Link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lei.ementa}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Publicação: {new Date(lei.dataPublicacao).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {lei.categoria}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLeis.length === 0 && crimeResults.length === 0 && crimeResultsMilitares.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma lei encontrada</h3>
                    <p className="text-sm">Tente ajustar os filtros de busca ou usar outros termos.</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>



      {/* Avisos de Segurança */}
      <Card className="ai-card border-yellow-500/30 bg-yellow-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-400 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">Aviso Importante</h4>
              <p className="text-sm text-yellow-200/80">
                Este sistema é destinado exclusivamente para consulta oficial. O uso inadequado ou para fins ilícitos 
                pode resultar em sanções penais conforme previsto no Código Penal Brasileiro (artigos 297 a 337) e 
                demais legislações aplicáveis. Todos os acessos são registrados e monitorados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="militar">
      {/* Seção de Legislação Militar */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Award className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-card-foreground">
                Legislação Militar - Pernambuco
              </CardTitle>
              <CardDescription>
                Código Penal Militar, Regulamentos e Normas aplicáveis às corporações militares de PE
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros de Busca Militar */}
      <Card className="ai-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por crime, número, título ou conteúdo da lei militar..."
                  value={searchTermMilitar}
                  onChange={(e) => setSearchTermMilitar(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleSearchMilitar} className="ai-button-primary">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedStatusMilitar} onValueChange={setSelectedStatusMilitar}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="todas">Todos os Status</SelectItem>
                    <SelectItem value="vigente">Vigente</SelectItem>
                    <SelectItem value="revogada">Revogada</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de Crimes Militares */}
      {filteredCrimesMilitares.length > 0 && (
      <Card className="ai-card border-red-500/30 bg-red-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            <CardTitle className="text-lg text-red-400">
                Crimes Militares Encontrados
            </CardTitle>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                {filteredCrimesMilitares.length} resultado(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {filteredCrimesMilitares.map((crime, index) => (
                <Card key={index} className="ai-card border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-red-400">
                              {crime.crime.toUpperCase()}
                            </h3>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {crime.artigo} - CPM
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-card-foreground">
                            {crime.descricao}
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-red-400" />
                          <span className="text-sm font-semibold text-red-400">PENA:</span>
                        </div>
                        <p className="text-sm text-red-300">{crime.pena}</p>
                        <div className="mt-2 text-xs text-red-400">
                          Prescrição (art. 125 CPM): <strong>{getPrescricaoMilitar(crime.pena)}</strong>
                        </div>
                        {crime.observacoes && (
                          <div className="mt-2 text-xs text-muted-foreground italic">{crime.observacoes}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </CardContent>
      </Card>
      )}

      {/* Leis Militares */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-card-foreground">
              Legislação Militar Específica - PE
            </CardTitle>
            <Badge variant="outline" className="bg-card text-card-foreground border-border">
              {filteredLeisMilitares.length} lei(s) militar(es)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {filteredLeisMilitares.map((lei) => (
                <Card key={lei.id} className="ai-card border border-border/60">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">
                              {lei.numero} / {lei.ano}
                            </h3>
                            <Badge className={getStatusColor(lei.status)}>
                              {lei.status.charAt(0).toUpperCase() + lei.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {lei.titulo}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {lei.link && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ai-button-secondary"
                                onClick={() => handleLinkClick(lei.link!, lei.titulo)}
                                title="Abrir Lei"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ai-button-secondary"
                                onClick={() => handleCopyLink(lei.link!, lei.titulo)}
                                title="Copiar Link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                      </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lei.ementa}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Publicação: {new Date(lei.dataPublicacao).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {lei.categoria}
                        </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLeisMilitares.length === 0 && filteredCrimesMilitares.length === 0 && searchTermMilitar && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma lei ou crime militar encontrado</h3>
                    <p className="text-sm">Tente ajustar os filtros de busca ou usar outros termos.</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Aviso Específico para Legislação Militar */}
      <Card className="ai-card border-red-500/30 bg-red-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-red-400 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-red-400">Legislação Militar - PE</h4>
              <p className="text-sm text-red-200/80">
                Esta seção contém informações sobre crimes militares e legislação específica aplicável às 
                corporações militares de Pernambuco (PMPE e CBMPE). Sempre consulte o Regulamento Disciplinar 
                e a Justiça Militar para casos específicos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="crimes-militares">
      {/* Seção Específica de Crimes Militares */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-card-foreground">
                Tipificação de Crimes Militares
              </CardTitle>
              <CardDescription>
                Busque e consulte crimes militares no Código Penal Militar (CPM) para tipificação e cálculo de prescrição
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Busca Específica de Crimes Militares */}
      <Card className="ai-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Ex: deserção, insubordinação, 187, abandono de posto, desacato..."
                  value={searchTermMilitar}
                  onChange={(e) => setSearchTermMilitar(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAndShowCrimesMilitares()}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={searchAndShowCrimesMilitares} className="ai-button-primary">
                <Search className="h-4 w-4 mr-2" />
                Buscar Crime
              </Button>
            </div>
            
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">INSTRUÇÕES:</span>
              </div>
              <p className="text-sm text-blue-300">
                1. Digite o nome do crime militar, artigo ou descrição que deseja consultar<br/>
                2. Clique em "Buscar Crime" para encontrar crimes militares relacionados<br/>
                3. O sistema mostrará os resultados com tipificação e prescrição<br/>
                4. Clique em "Consultar CPM" para abrir o Código Penal Militar
              </p>
            </div>
            

          </div>
        </CardContent>
      </Card>

      {/* Resultados de Crimes Militares */}
      {filteredCrimesMilitares.length > 0 && (
        <Card className="ai-card border-red-500/30 bg-red-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-lg text-red-400">
                Crimes Militares Encontrados
              </CardTitle>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                {filteredCrimesMilitares.length} resultado(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCrimesMilitares.map((crime, index) => (
                <Card key={index} className="ai-card border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-red-400">
                              {crime.crime.toUpperCase()} (Penal Militar)
                            </h3>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {crime.artigo} - CPM
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-card-foreground">
                            {crime.descricao}
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-red-400" />
                          <span className="text-sm font-semibold text-red-400">PENA:</span>
                        </div>
                        <p className="text-sm text-red-300">{crime.pena}</p>
                        <div className="mt-2 text-xs text-red-400">
                          Prescrição (art. 125 CPM): <strong>{calculatePrescricaoMilitar(crime.artigo, crime.pena)}</strong>
                        </div>
                        {crime.observacoes && (
                          <div className="mt-2 text-xs text-muted-foreground italic">{crime.observacoes}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => openCPMArticle(crime.artigo)}
                          className="ai-button-primary bg-red-600 hover:bg-red-700"
                          size="sm"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Consultar CPM
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ai-button-secondary"
                          onClick={() => handleCopyLink("https://www.planalto.gov.br/ccivil_03/decreto-lei/del1001.htm", `CPM - ${crime.artigo}`)}
                          title="Copiar Link do CPM"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aviso Específico para Crimes Militares */}
      <Card className="ai-card border-red-500/30 bg-red-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-red-400">Tipificação de Crimes Militares</h4>
              <p className="text-sm text-red-200/80">
                <strong>Importante:</strong> A prescrição militar segue o art. 125 do Código Penal Militar, 
                que possui prazos diferentes do Código Penal comum. Sempre consulte o texto completo do CPM 
                para casos específicos e busque orientação jurídica especializada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

  </Tabs>
</div>
);
};

export default LegislacaoSection;

