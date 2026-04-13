// Grading system logic for pengetahuan and sikap modes
function calculateGrade(score, mode) {
    let grade;
    if(mode === 'pengetahuan') {
        if(score >= 90) grade = 'A';
        else if(score >= 80) grade = 'B';
        else if(score >= 70) grade = 'C';
        else if(score >= 60) grade = 'D';
        else grade = 'F';
    } else if(mode === 'sikap') {
        if(score >= 75) grade = 'Baik';
        else if(score >= 50) grade = 'Cukup';
        else grade = 'Kurang';
    }
    return grade;
}

// Example usage
console.log(calculateGrade(85, 'pengetahuan')); // Outputs: B
console.log(calculateGrade(70, 'sikap')); // Outputs: Baik
