/**
 * Traduit les erreurs d'authentification Supabase en messages français clairs
 */
export function translateAuthError(error: any): string {
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';

    // Messages d'erreur Supabase courants
    if (errorMessage.includes('Invalid login credentials')) {
        return 'Email ou mot de passe incorrect. Veuillez réessayer.';
    }

    if (errorMessage.includes('Email not confirmed')) {
        return 'Veuillez confirmer votre email avant de vous connecter.';
    }

    if (errorMessage.includes('User already registered')) {
        return 'Cette adresse email est déjà utilisée. Essayez de vous connecter.';
    }

    if (errorMessage.includes('Password should be at least')) {
        return 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (errorMessage.includes('Unable to validate email address')) {
        return 'Adresse email invalide. Vérifiez votre saisie.';
    }

    if (errorMessage.includes('Signup requires a valid password')) {
        return 'Veuillez entrer un mot de passe valide.';
    }

    if (errorMessage.includes('User not found')) {
        return 'Aucun compte ne correspond à cet email.';
    }

    if (errorCode === 'email_exists' || errorMessage.includes('already been registered')) {
        return 'Cette adresse email est déjà utilisée.';
    }

    if (errorMessage.includes('Email rate limit exceeded')) {
        return 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
    }

    if (errorMessage.includes('Invalid recovery token')) {
        return 'Le lien de récupération a expiré ou est invalide. Demandez un nouveau lien.';
    }

    if (errorMessage.includes('New password should be different')) {
        return 'Le nouveau mot de passe doit être différent de l\'ancien.';
    }

    // Message par défaut si aucune traduction spécifique
    return 'Une erreur est survenue. Veuillez réessayer ou contacter le support.';
}
