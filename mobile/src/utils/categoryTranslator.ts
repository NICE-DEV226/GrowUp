// Fonction pour traduire les catégories de transactions
export const translateCategory = (category: string, t: (key: string) => string): string => {
  // Mapping des catégories vers les clés de traduction
  const categoryMap: { [key: string]: string } = {
    // Dépenses
    'Nourriture': 'food',
    'Food': 'food',
    'Comida': 'food',
    
    'Logement': 'housing',
    'Housing': 'housing',
    'Vivienda': 'housing',
    
    'Transport': 'transport',
    'Transporte': 'transport',
    
    'Shopping': 'shopping',
    'Compras': 'shopping',
    
    'Santé': 'health',
    'Health': 'health',
    'Salud': 'health',
    
    'Loisirs': 'entertainment',
    'Entertainment': 'entertainment',
    'Entretenimiento': 'entertainment',
    
    'Autre': 'other',
    'Other': 'other',
    'Otro': 'other',
    
    // Revenus
    'Salaire': 'salary',
    'Salary': 'salary',
    'Salario': 'salary',
    
    'Freelance': 'freelance',
    
    'Investissement': 'investment',
    'Investment': 'investment',
    'Inversión': 'investment',
    
    'Cadeau': 'gift',
    'Gift': 'gift',
    'Regalo': 'gift',
  };

  const key = categoryMap[category];
  return key ? t(key) : category;
};
