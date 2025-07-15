import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  X, 
  Brain, 
  Scale, 
  AlertTriangle,
  CheckCircle,
  Printer
} from "lucide-react";
import { RelatorioIA as RelatorioIAType } from "@/services/openaiService";

interface RelatorioIAProps {
  relatorio: RelatorioIAType;
  onClose: () => void;
  dadosProcesso?: {
    numero?: string;
    nome?: string;
    unidade?: string;
    data?: string;
  };
}

const RelatorioIA = ({ relatorio, onClose, dadosProcesso }: RelatorioIAProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Gerar conteúdo do relatório para download
    const conteudoRelatorio = `
RELATÓRIO JURÍDICO MILITAR - ANÁLISE IA
${dadosProcesso?.numero ? `Processo: ${dadosProcesso.numero}` : ''}
${dadosProcesso?.nome ? `Investigado: ${dadosProcesso.nome}` : ''}
${dadosProcesso?.unidade ? `Unidade: ${dadosProcesso.unidade}` : ''}
${dadosProcesso?.data ? `Data: ${dadosProcesso.data}` : ''}
Gerado em: ${new Date().toLocaleString('pt-BR')}

========================================

DESCRIÇÃO SUCINTA
${relatorio.descricao_sucinta}

========================================

FUNDAMENTAÇÃO LEGAL
${relatorio.fundamentacao_legal}

========================================

CONCLUSÃO
${relatorio.conclusao}

========================================

TIPIFICAÇÃO PENAL
${relatorio.tipificacao_penal}

========================================

PROVIDÊNCIAS SUGERIDAS
${relatorio.providencias_sugeridas}

========================================

OBSERVAÇÃO: Este relatório foi gerado com auxílio de Inteligência Artificial 
e deve ser revisado por autoridade competente antes da utilização oficial.

Sistema NOBILIS-IA - Plataforma Inteligente de Análise Jurídica Militar
    `;

    // Criar e baixar arquivo
    const blob = new Blob([conteudoRelatorio], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_juridico_ia_${dadosProcesso?.numero || 'processo'}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('relatorio-conteudo');
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Relatório Jurídico IA</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { color: #1e40af; margin-top: 30px; }
              h3 { color: #dc2626; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>RELATÓRIO JURÍDICO MILITAR - ANÁLISE IA</h1>
              <p><strong>Sistema NOBILIS-IA</strong></p>
              <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            ${printContent.innerHTML}
            <div class="footer">
              <p><strong>OBSERVAÇÃO:</strong> Este relatório foi gerado com auxílio de Inteligência Artificial e deve ser revisado por autoridade competente antes da utilização oficial.</p>
            </div>
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Relatório Jurídico Militar - Análise IA</CardTitle>
                <p className="text-blue-100 text-sm">
                  Gerado em {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-100 border-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Processado
              </Badge>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[600px] p-6">
            <div id="relatorio-conteudo">
              {/* Dados do Processo */}
              {dadosProcesso && (
                <Card className="mb-6 bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Dados do Processo
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {dadosProcesso.numero && (
                        <div>
                          <span className="font-medium">Processo:</span> {dadosProcesso.numero}
                        </div>
                      )}
                      {dadosProcesso.nome && (
                        <div>
                          <span className="font-medium">Investigado:</span> {dadosProcesso.nome}
                        </div>
                      )}
                      {dadosProcesso.unidade && (
                        <div>
                          <span className="font-medium">Unidade:</span> {dadosProcesso.unidade}
                        </div>
                      )}
                      {dadosProcesso.data && (
                        <div>
                          <span className="font-medium">Data:</span> {dadosProcesso.data}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Descrição Sucinta */}
              <div className="section mb-6">
                <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  DESCRIÇÃO SUCINTA
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {relatorio.descricao_sucinta}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Fundamentação Legal */}
              <div className="section mb-6">
                <h2 className="text-lg font-bold text-purple-600 mb-3 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  FUNDAMENTAÇÃO LEGAL
                </h2>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {relatorio.fundamentacao_legal}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Conclusão */}
              <div className="section mb-6">
                <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  CONCLUSÃO
                </h2>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {relatorio.conclusao}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Tipificação Penal */}
              <div className="section mb-6">
                <h2 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  TIPIFICAÇÃO PENAL
                </h2>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {relatorio.tipificacao_penal}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Providências Sugeridas */}
              <div className="section mb-6">
                <h2 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  PROVIDÊNCIAS SUGERIDAS
                </h2>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {relatorio.providencias_sugeridas}
                  </p>
                </div>
              </div>

              {/* Aviso Legal */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Aviso Importante</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Este relatório foi gerado com auxílio de Inteligência Artificial e deve ser 
                        revisado por autoridade competente antes da utilização oficial. O conteúdo 
                        serve como orientação técnica e não substitui a análise jurídica especializada.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Botões de Ação */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Sistema NOBILIS-IA - Análise Jurídica Inteligente
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Baixando...' : 'Baixar Relatório'}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioIA; 