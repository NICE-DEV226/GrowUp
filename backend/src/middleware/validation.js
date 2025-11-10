const { z } = require('zod');

// Schémas de validation

// Transaction
const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type doit être "income" ou "expense"' })
  }),
  category: z.string().min(1, 'Catégorie requise').max(50, 'Catégorie trop longue'),
  amount: z.number().positive('Le montant doit être positif'),
  date: z.string().optional(),
  note: z.string().max(500, 'Note trop longue').optional(),
  accountId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional()
});

// Goal
const goalSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(100, 'Titre trop long'),
  targetAmount: z.number().positive('Le montant cible doit être positif'),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide (format: #RRGGBB)').optional(),
  category: z.string().optional(),
  priority: z.number().int().min(0).optional()
});

// Account
const accountSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(50, 'Nom trop long'),
  balance: z.number().optional(),
  currency: z.string().length(3, 'Code devise invalide (3 lettres)').optional()
});

// User update
const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  country: z.string().length(2, 'Code pays invalide (2 lettres)').optional(),
  currency: z.enum(['EUR', 'USD', 'GBP', 'CHF', 'XOF', 'XAF', 'MAD', 'TND', 'ZAR', 'NGN', 'GHS', 'KES'], {
    errorMap: () => ({ message: 'Devise non supportée' })
  }).optional(),
  language: z.enum(['Français', 'English', 'Español'], {
    errorMap: () => ({ message: 'Langue non supportée' })
  }).optional()
});

// Password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
});

// Preferences
const preferencesSchema = z.object({
  currency: z.string().optional(),
  language: z.string().optional(),
  theme: z.enum(['Sombre', 'Clair', 'Automatique']).optional(),
  notifications: z.object({
    push: z.boolean().optional(),
    email: z.boolean().optional(),
    budgetAlerts: z.boolean().optional(),
    goalReminders: z.boolean().optional()
  }).optional()
});

// Transfer
const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Compte source requis'),
  toAccountId: z.string().min(1, 'Compte destination requis'),
  amount: z.number().positive('Le montant doit être positif')
});

// Allocate to goal
const allocateSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  accountId: z.string().optional()
});

// Middleware de validation
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation échouée',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
  transactionSchema,
  goalSchema,
  accountSchema,
  userUpdateSchema,
  passwordChangeSchema,
  preferencesSchema,
  transferSchema,
  allocateSchema
};
