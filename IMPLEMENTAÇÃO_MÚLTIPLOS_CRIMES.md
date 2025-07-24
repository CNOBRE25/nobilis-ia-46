# Implementação de Seleção Múltipla de Crimes

## 🎯 **Objetivo**

Permitir que o usuário selecione **múltiplos crimes** na aba de Tipificação Criminal, em vez de apenas um crime por processo.

## ✅ **Funcionalidades Implementadas**

### 1. **Interface de Seleção Múltipla**

#### **Antes (Seleção Única):**
```javascript
<Select value={formData.tipoCrime} onValueChange={value => setField('tipoCrime', value)}>
  <SelectValue placeholder="Selecione um crime" />
  <SelectContent>
    {/* Lista de crimes */}
  </SelectContent>
</Select>
```

#### **Depois (Seleção Múltipla):**
```javascript
<div className="max-h-64 overflow-y-auto bg-white/10 rounded-lg border border-white/20 p-3">
  {Object.entries(crimes).map(([categoria, lista]) => (
    <div key={categoria} className="mb-4">
      <div className="px-2 py-1 text-xs text-blue-300 uppercase tracking-wide font-medium border-b border-white/20 mb-2">
        {categoria}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {lista.map(crime => (
          <div key={crime} className="flex items-center space-x-2">
            <Checkbox
              checked={formData.crimesSelecionados?.includes(crime) || false}
              onCheckedChange={(checked) => {
                // Lógica de adicionar/remover crime
              }}
            />
            <Label>{crime}</Label>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

### 2. **Visualização dos Crimes Selecionados**

```javascript
{formData.crimesSelecionados && formData.crimesSelecionados.length > 0 && (
  <div className="mt-4">
    <Label>Crimes Selecionados:</Label>
    <div className="mt-2 flex flex-wrap gap-2">
      {formData.crimesSelecionados.map((crime, index) => (
        <Badge key={index} variant="secondary" className="bg-blue-600/20 text-blue-200">
          {crime}
          <button onClick={() => removeCrime(crime)}>×</button>
        </Badge>
      ))}
    </div>
  </div>
)}
```

### 3. **Estrutura de Dados**

#### **Novo Campo no Formulário:**
```javascript
const initialForm = {
  // ... outros campos
  tipoCrime: "", // Mantido para compatibilidade
  crimesSelecionados: [], // Novo campo para múltiplos crimes
  // ... outros campos
};
```

#### **Banco de Dados:**
```sql
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS crimes_selecionados JSONB DEFAULT '[]';
```

### 4. **Lógica de Seleção**

```javascript
onCheckedChange={(checked) => {
  const crimesAtuais = formData.crimesSelecionados || [];
  if (checked) {
    // Adicionar crime
    setField('crimesSelecionados', [...crimesAtuais, crime]);
  } else {
    // Remover crime
    setField('crimesSelecionados', crimesAtuais.filter(c => c !== crime));
  }
}}
```

## 🔧 **Arquivos Modificados**

### `src/components/NovoProcessoForm.tsx`
- ✅ Adicionado campo `crimesSelecionados` no `initialForm`
- ✅ Incluído no salvamento (modo edição e criação)

### `src/components/ProcessBasicDataForm.tsx`
- ✅ Substituído Select único por Checkboxes múltiplos
- ✅ Adicionado visualização dos crimes selecionados
- ✅ Implementada lógica de adicionar/remover crimes
- ✅ Adicionados imports para Checkbox e Badge

### `src/components/ProcessList.tsx`
- ✅ Adicionado mapeamento do campo `crimes_selecionados`

### `add_crimes_selecionados_column.sql`
- ✅ Script SQL para adicionar coluna no banco de dados
- ✅ Índice GIN para performance
- ✅ Comentários de documentação

## 📋 **Categorias de Crimes Disponíveis**

### **1. Crimes contra a Pessoa**
- Homicídio simples, qualificado, culposo
- Lesão corporal, sequestro, ameaça
- Infanticídio, aborto, etc.

### **2. Crimes contra a Mulher**
- Violência doméstica, feminicídio
- Estupro, assédio sexual
- Importunação sexual, etc.

### **3. Crimes contra Criança e Adolescente**
- Abuso sexual, exploração sexual
- Violência física, maus-tratos
- Negligência, aliciamento, etc.

### **4. Crimes contra População Racial**
- Racismo, discriminação racial
- Injúria racial, incitação ao ódio
- Lesão corporal por motivo racial

### **5. Crimes contra LGBTQIA+**
- Discriminação por orientação sexual
- Lesão corporal por motivação LGBTfóbica
- Homicídio motivado por LGBTfobia

### **6. Crimes Cibernéticos / Informática**
- Invasão de dispositivo informático
- Fraude eletrônica, phishing
- Difamação pela internet, etc.

### **7. Crimes contra a Honra**
- Calúnia, difamação, injúria

### **8. Crimes contra a Liberdade Individual**
- Constrangimento ilegal
- Violação de domicílio
- Tráfico de pessoas

### **9. Crimes contra a Dignidade Sexual**
- Estupro, estupro de vulnerável
- Importunação sexual, assédio sexual
- Divulgação de cena de sexo sem consentimento

### **10. Crimes contra o Patrimônio**
- Furto, roubo, extorsão
- Estelionato, apropriação indébita
- Receptação, dano

### **11. Crimes contra a Fé Pública**
- Falsidade ideológica
- Falsificação de documentos
- Moeda falsa

### **12. Crimes contra a Administração Pública**
- Peculato, corrupção passiva/ativa
- Concussão, prevaricação
- Violação de sigilo funcional

### **13. Crimes contra a Administração da Justiça**
- Desacato, desobediência
- Coação no curso do processo
- Corrupção de testemunha

### **14. Crimes da Lei de Drogas**
- Tráfico de drogas
- Associação para o tráfico
- Porte para uso pessoal

### **15. Crimes da Lei de Tortura**
- Tortura física, psicológica
- Tortura por discriminação

### **16. Crimes da Lei de Lavagem de Dinheiro**
- Lavagem de dinheiro

### **17. Crimes da Lei Antiterrorismo**
- Terrorismo

### **18. Crimes Hediondos**
- Homicídio qualificado, latrocínio
- Estupro, estupro de vulnerável
- Extorsão mediante sequestro com morte

### **19. Crimes Militares**
- Motim, revolta, insubordinação
- Deserção, abandono de posto
- Violência contra superior, etc.

## 🎯 **Benefícios da Implementação**

1. **✅ Flexibilidade**: Permite selecionar múltiplos crimes por processo
2. **✅ Organização**: Crimes organizados por categorias
3. **✅ Visualização**: Mostra claramente quais crimes foram selecionados
4. **✅ Remoção fácil**: Botão × para remover crimes individualmente
5. **✅ Compatibilidade**: Mantém campo `tipo_crime` para compatibilidade
6. **✅ Performance**: Índice GIN para consultas eficientes
7. **✅ UX melhorada**: Interface intuitiva com checkboxes

## 🧪 **Como Testar**

### **Teste de Seleção Múltipla:**
1. Abra um processo (novo ou existente)
2. Vá para a aba "Tipificação Criminal"
3. Selecione múltiplos crimes de diferentes categorias
4. Verifique se aparecem como badges azuis
5. Remova alguns crimes clicando no ×
6. Salve o processo
7. Abra novamente para verificar se os crimes foram salvos

### **Teste de Edição:**
1. Edite um processo com crimes já selecionados
2. Adicione novos crimes
3. Remova crimes existentes
4. Salve e verifique se as mudanças foram aplicadas

### **Teste de Estatísticas:**
1. Crie processos com diferentes combinações de crimes
2. Vá para a página de estatísticas
3. Verifique se os dados aparecem corretamente

## 🔍 **Estrutura JSON no Banco**

```json
{
  "crimes_selecionados": [
    "Homicídio qualificado",
    "Lesão corporal",
    "Ameaça",
    "Furto"
  ]
}
```

## 🚀 **Próximos Passos**

1. **Executar script SQL** no Supabase
2. **Testar funcionalidade** completa
3. **Atualizar estatísticas** para considerar múltiplos crimes
4. **Documentar** para usuários finais
5. **Considerar** migração de dados existentes 