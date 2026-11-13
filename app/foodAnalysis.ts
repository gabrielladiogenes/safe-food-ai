
import { z } from "zod";

// Estrutura das informações geradas pela IA
export const foodAnalysisSchema = z.object({
  avisoAlimentar: z.string().min(1),

  sugestaoIA: z.string().min(1),

  selo: z.enum([
    "ALERGIA DECLARADA",
    "INTOLERÂNCIA DECLARADA",
    "RESTRIÇÃO INFORMADA",
    "SEM SELO",
  ]),

  precisaConfirmacao: z.boolean(),
});

// Tipo de dados da análise alimentar
export type FoodAnalysis = z.infer<typeof foodAnalysisSchema>;

// Valida a estrutura da resposta da IA
export function validarAnalise(dados: unknown) {
  return foodAnalysisSchema.safeParse(dados);
}
