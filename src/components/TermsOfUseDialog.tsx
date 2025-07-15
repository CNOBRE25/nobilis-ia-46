
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Scale } from "lucide-react";

interface TermsOfUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsOfUseDialog = ({ open, onOpenChange }: TermsOfUseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl font-bold">Termos de Uso - NOBILIS-IA</DialogTitle>
          </div>
          <DialogDescription>
            Plataforma Inteligente para Análise de Pareceres Jurídicos
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introdução */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                1. ACEITE DOS TERMOS
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar a plataforma NOBILIS-IA, você concorda integralmente com estes termos de uso 
                e se compromete a cumprir todas as disposições legais aplicáveis, incluindo, mas não se limitando 
                ao Código Penal Brasileiro, Lei Geral de Proteção de Dados Pessoais (LGPD - Lei 13.709/2018), 
                Marco Civil da Internet (Lei 12.965/2014) e demais legislações pertinentes.
              </p>
            </section>

            {/* Finalidade */}
            <section>
              <h3 className="font-semibold text-base mb-3">2. FINALIDADE DA PLATAFORMA</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                A plataforma NOBILIS-IA destina-se exclusivamente ao apoio técnico-jurídico para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Análise e elaboração de pareceres jurídicos</li>
                <li>Consulta à legislação aplicável</li>
                <li>Gestão de processos administrativos</li>
                <li>Apoio à decisão em questões jurídicas</li>
              </ul>
            </section>

            {/* Proteção de Dados */}
            <section>
              <h3 className="font-semibold text-base mb-3">3. PROTEÇÃO DE DADOS PESSOAIS (LGPD)</h3>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>3.1.</strong> O tratamento de dados pessoais observa rigorosamente a Lei 13.709/2018 (LGPD), 
                  sendo coletados apenas dados necessários ao funcionamento da plataforma.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>3.2.</strong> Os dados são tratados com base no legítimo interesse e exercício regular de direitos 
                  em processo judicial, administrativo ou arbitral (art. 7º, VI e IX, LGPD).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>3.3.</strong> É vedado o compartilhamento de dados pessoais com terceiros não autorizados.
                </p>
              </div>
            </section>

            {/* Uso Adequado */}
            <section>
              <h3 className="font-semibold text-base mb-3">4. USO ADEQUADO DA PLATAFORMA</h3>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>4.1.</strong> A plataforma deve ser utilizada exclusivamente para fins legítimos e profissionais.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>4.2.</strong> É proibido utilizar a plataforma para atividades ilícitas, fraudulentas ou que violem direitos de terceiros.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>4.3.</strong> O usuário deve manter sigilo sobre informações confidenciais acessadas na plataforma.
                </p>
              </div>
            </section>

            {/* Condutas Proibidas */}
            <section>
              <h3 className="font-semibold text-base mb-3 text-destructive">5. CONDUTAS EXPRESSAMENTE PROIBIDAS</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Acesso não autorizado a dados ou sistemas (Crime: art. 154-A, CP)</li>
                <li>Violação de sigilo funcional (Crime: art. 325, CP)</li>
                <li>Falsificação de documentos (Crime: arts. 297-299, CP)</li>
                <li>Divulgação não autorizada de dados pessoais (Crime: art. 154-A, CP c/c LGPD)</li>
                <li>Uso indevido de informações privilegiadas</li>
                <li>Tentativa de burlar controles de segurança</li>
                <li>Compartilhamento de credenciais de acesso</li>
              </ul>
            </section>

            {/* Sanções Penais */}
            <Alert className="border-destructive bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                <h4 className="font-semibold text-base mb-2">6. SANÇÕES PENAIS E ADMINISTRATIVAS</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">6.1. CRIMES CONTRA A INCOLUMIDADE PÚBLICA:</p>
                    <p>• Art. 154-A, CP - Invasão de dispositivo informático: <strong>detenção de 3 meses a 1 ano + multa</strong></p>
                  </div>
                  <div>
                    <p className="font-semibold">6.2. CRIMES CONTRA A ADMINISTRAÇÃO PÚBLICA:</p>
                    <p>• Art. 325, CP - Violação de sigilo funcional: <strong>detenção de 6 meses a 2 anos + multa</strong></p>
                    <p>• Art. 319, CP - Prevaricação: <strong>detenção de 3 meses a 1 ano + multa</strong></p>
                  </div>
                  <div>
                    <p className="font-semibold">6.3. CRIMES CONTRA A FÉ PÚBLICA:</p>
                    <p>• Arts. 297-299, CP - Falsificação documental: <strong>reclusão de 2 a 6 anos + multa</strong></p>
                  </div>
                  <div>
                    <p className="font-semibold">6.4. LGPD - SANÇÕES ADMINISTRATIVAS:</p>
                    <p>• Multa de até <strong>R$ 50.000.000,00</strong> ou 2% do faturamento</p>
                    <p>• Bloqueio ou eliminação dos dados</p>
                    <p>• Suspensão do exercício da atividade</p>
                  </div>
                  <div>
                    <p className="font-semibold">6.5. SANÇÕES ADMINISTRATIVAS INTERNAS:</p>
                    <p>• Advertência • Suspensão • Demissão • Responsabilização civil</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Responsabilidades */}
            <section>
              <h3 className="font-semibold text-base mb-3">7. RESPONSABILIDADES DO USUÁRIO</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Manter suas credenciais de acesso em segurança</li>
                <li>Notificar imediatamente qualquer uso não autorizado</li>
                <li>Utilizar a plataforma conforme sua finalidade</li>
                <li>Respeitar os direitos de propriedade intelectual</li>
                <li>Cumprir todas as normas legais aplicáveis</li>
              </ul>
            </section>

            {/* Vigência */}
            <section>
              <h3 className="font-semibold text-base mb-3">8. VIGÊNCIA E ALTERAÇÕES</h3>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos entram em vigor na data de aceite e permanecem válidos enquanto durar o acesso à plataforma. 
                Eventuais alterações serão comunicadas previamente e requerem novo aceite.
              </p>
            </section>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-muted-foreground text-center">
                <strong>IMPORTANTE:</strong> O descumprimento destes termos pode resultar em responsabilização criminal, 
                civil e administrativa, conforme previsto na legislação brasileira vigente.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseDialog;
