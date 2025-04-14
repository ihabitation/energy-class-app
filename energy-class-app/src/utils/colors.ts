export const getClassColor = (classType: 'A' | 'B' | 'C' | 'D' | 'NA') => {
  switch (classType) {
    case 'A':
      return '#2E7D32'; // Vert foncé
    case 'B':
      return '#81C784'; // Vert pâle
    case 'C':
      return '#FFB74D'; // Jaune
    case 'D':
      return '#E57373'; // Rouge
    case 'NA':
      return '#9E9E9E'; // Gris
    default:
      return '#000000';
  }
};

export const getClassTextColor = (classType: 'A' | 'B' | 'C' | 'D' | 'NA') => {
  switch (classType) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
      return '#FFFFFF'; // Blanc pour les classes A, B, C, D
    case 'NA':
      return '#000000'; // Noir pour NA
    default:
      return '#000000';
  }
}; 