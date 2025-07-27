import { Process, ProcessFormData, SetFieldFunction, Investigado, Vitima } from './process';
import { User } from './user';
import { Parecer } from './parecer';

// Props para NovoProcessoForm
export interface NovoProcessoFormProps {
  onProcessCreated?: () => void;
  processo?: Process | null;
}

// Props para ProcessDetailsForm
export interface ProcessDetailsFormProps {
  formData: ProcessFormData;
  setField: SetFieldFunction;
  isSavingDetalhes: boolean;
  handleSaveDetalhes: () => void;
  savedProcessId: string | null;
  editProcess: Process | null;
}

// Props para ProcessBasicDataForm
export interface ProcessBasicDataFormProps {
  formData: ProcessFormData;
  setField: SetFieldFunction;
  isSavingBasic: boolean;
  handleSaveBasic: () => void;
  savedProcessId: string | null;
  editProcess: Process | null;
}

// Props para DiligenciasList
export interface DiligenciasListProps {
  formData: ProcessFormData;
  setField: SetFieldFunction;
  className?: string;
}

// Props para InvestigadosSection
export interface InvestigadosSectionProps {
  investigados: Investigado[];
  setInvestigados: React.Dispatch<React.SetStateAction<Investigado[]>>;
  updateInvestigado: (id: number, field: keyof Investigado, value: any) => void;
  addInvestigado: () => void;
  removeInvestigado: (id: number) => void;
  editProcess?: Process | null;
}

// Props para ProcessCard
export interface ProcessCardProps {
  process: Process;
  type: 'tramitacao' | 'arquivados' | 'todos';
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTipoProcessoLabel: (tipo: string) => string;
  handleEditProcess: (process: Process) => void;
  handleDeleteProcess: (process: Process) => void;
  handleViewProcess: (process: Process) => void;
  calculateDaysInProcess: (dataRecebimento: string) => number;
}

// Props para ProcessList
export interface ProcessListProps {
  type: 'tramitacao' | 'arquivados' | 'todos';
  onClose: () => void;
  orderBy?: string;
  orderAscending?: boolean;
}

// Props para ProcessSelector
export interface ProcessSelectorProps {
  onProcessSelect: (process: Process) => void;
  selectedProcessId?: string;
  className?: string;
}

// Props para NovoParecer
export interface NovoParecerProps {
  user: User;
  onClose: () => void;
  onSave: (parecer: Parecer) => void;
  numeroProcesso?: string;
  parecer?: Parecer;
}

// Props para PareceresSection
export interface PareceresSectionProps {
  user: User;
}

// Props para Dashboard
export interface DashboardProps {
  user: User;
}

// Props para StatisticsPage
export interface StatisticsPageProps {
  onClose: () => void;
  onProcessSaved?: () => void;
}

// Props para AdminPanel
export interface AdminPanelProps {
  onClose: () => void;
}

// Props para ProfileDialog
export interface ProfileDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

// Props para SettingsDialog
export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Props para ChangePasswordDialog
export interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Props para TermsOfUseDialog
export interface TermsOfUseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Props para RelatorioIA
export interface RelatorioIAProps {
  processId: string;
  onClose: () => void;
}

// Props para ProcessTest
export interface ProcessTestProps {
  // Adicione props específicas se necessário
}

// Props para SupabaseTest
export interface SupabaseTestProps {
  // Adicione props específicas se necessário
}

// Props para FunctionalityTable
export interface FunctionalityTableProps {
  // Adicione props específicas se necessário
}

// Props para DatabaseDiffChecker
export interface DatabaseDiffCheckerProps {
  // Adicione props específicas se necessário
} 