/**
 * Formate une date au format français (JJ/MM/AAAA)
 * @param date Date à formater
 * @returns Date formatée
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate un montant avec séparateur de milliers
 * @param montant Montant à formater
 * @returns Montant formaté
 */
export function formatMontant(montant: number): string {
  return montant.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Génère un nom de fichier sécurisé pour un document
 * @param societeNom Nom de la société
 * @param exercice Exercice
 * @param typePv Type de PV
 * @returns Nom de fichier sécurisé
 */
export function generateSafeFileName(societeNom: string, exercice: string, typePv: string): string {
  // Remplacer les caractères spéciaux et les espaces par des underscores
  const safeSocieteNom = societeNom.replace(/[^a-zA-Z0-9]/g, '_');
  const safeTypePv = typePv.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `PV_${safeSocieteNom}_${exercice}_${safeTypePv}`;
}

/**
 * Génère un slug à partir d'une chaîne de caractères
 * @param str Chaîne de caractères
 * @returns Slug
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Tronque une chaîne de caractères à une longueur maximale
 * @param str Chaîne de caractères
 * @param maxLength Longueur maximale
 * @returns Chaîne tronquée
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...';
}

/**
 * Vérifie si une chaîne de caractères est un email valide
 * @param email Email à vérifier
 * @returns true si l'email est valide, false sinon
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Vérifie si une chaîne de caractères est un numéro de téléphone valide
 * @param phone Numéro de téléphone à vérifier
 * @returns true si le numéro est valide, false sinon
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Calcule le pourcentage d'un nombre par rapport à un total
 * @param value Valeur
 * @param total Total
 * @returns Pourcentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

/**
 * Formate un pourcentage
 * @param percentage Pourcentage
 * @param decimals Nombre de décimales
 * @returns Pourcentage formaté
 */
export function formatPercentage(percentage: number, decimals: number = 2): string {
  return `${percentage.toFixed(decimals)}%`;
}
