export interface FaultCode {
  code: string;
  brand: string;
  symptom: string;
  cause: string;
  fix: string;
}

export const FAULT_CODES: FaultCode[] = [
  { code: "F22", brand: "Vaillant", symptom: "Pression d'eau insuffisante", cause: "Fuite ou perte de pression dans le circuit", fix: "Remettre en pression (1-1.5 bar), vérifier les fuites." },
  { code: "F27", brand: "Vaillant", symptom: "Détection de flamme parasite", cause: "Électrode ou carte défaillante", fix: "Contrôler électrode d'ionisation, remplacer si nécessaire." },
  { code: "F28", brand: "Vaillant", symptom: "Échec allumage", cause: "Vanne gaz ou bougie d'allumage", fix: "Vérifier alimentation gaz, nettoyer/remplacer bougie." },
  { code: "F75", brand: "Vaillant", symptom: "Pompe ou capteur pression", cause: "Pompe bloquée ou capteur HS", fix: "Débloquer pompe, contrôler capteur pression." },
  { code: "F.0", brand: "Saunier Duval", symptom: "Sonde départ défaillante", cause: "Sonde CTN circuit chauffage", fix: "Remplacer sonde départ." },
  { code: "F.28", brand: "Saunier Duval", symptom: "Pas d'allumage", cause: "Manque gaz / électrode", fix: "Vérifier vanne et électrode." },
  { code: "EA", brand: "Chaffoteaux", symptom: "Défaut allumage", cause: "Pas de détection de flamme", fix: "Contrôler arrivée gaz et électrode." },
  { code: "E10", brand: "Bosch", symptom: "Manque d'eau", cause: "Pression trop basse", fix: "Réajuster la pression à 1.5 bar." },
  { code: "EA1", brand: "Bosch", symptom: "Surchauffe", cause: "Pompe ou échangeur entartré", fix: "Détartrage, vérifier circulateur." },
  { code: "F4", brand: "Viessmann", symptom: "Pas de formation de flamme", cause: "Vanne gaz", fix: "Contrôler alimentation et vanne." },
  { code: "F5", brand: "Viessmann", symptom: "Pressostat air", cause: "Conduit fumée obstrué", fix: "Vérifier conduit, ventilateur." },
  { code: "501", brand: "ELM Leblanc", symptom: "Pas de flamme", cause: "Allumage défectueux", fix: "Inspecter électrodes, vanne gaz." },
  { code: "P1", brand: "Ferroli", symptom: "Pression basse", cause: "Perte pression circuit", fix: "Recharger circuit, purger." },
  { code: "A01", brand: "Ariston", symptom: "Pas d'allumage", cause: "Flamme non détectée", fix: "Contrôler gaz, électrode, carte." },
  { code: "108", brand: "De Dietrich", symptom: "Manque eau", cause: "Pression insuffisante", fix: "Remettre en pression." },
];
