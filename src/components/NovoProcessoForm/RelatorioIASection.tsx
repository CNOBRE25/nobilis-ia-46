import { useProcessFormContext } from './ProcessFormContext';

export default function RelatorioIASection({ iaFundamentacao, prescricaoIA, isLoading }: { iaFundamentacao: string; prescricaoIA: string; isLoading?: boolean }) {
  const { form } = useProcessFormContext();
  // ... restante do componente ...
} 