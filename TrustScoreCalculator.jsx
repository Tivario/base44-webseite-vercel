import { base44 } from '@/api/base44Client';

/**
 * Berechnet den Trust-Score eines Nutzers basierend auf verschiedenen Faktoren
 */
export async function calculateTrustScore(userEmail) {
  try {
    // Transaktionshistorie abrufen
    const completedTransactions = await base44.entities.Transaction.filter({
      $or: [{ seller_email: userEmail }, { buyer_email: userEmail }],
      status: 'completed'
    });

    // Reviews abrufen
    const reviews = await base44.entities.Review.filter({
      seller_email: userEmail
    });

    // Reports gegen User
    const reports = await base44.entities.Report.filter({
      target_user_email: userEmail,
      status: { $in: ['offen', 'in_pruefung'] }
    });

    // Bewertungen berechnen
    const totalTransactions = completedTransactions.length;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const activeReports = reports.length;

    // User-Daten für Account-Alter
    const users = await base44.entities.User.filter({ email: userEmail });
    const user = users[0];
    const accountAge = user?.created_date
      ? Math.floor((Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Trust-Score Berechnung (0-100)
    let score = 50; // Basis-Score

    // +30 Punkte für Transaktionen (max)
    score += Math.min(30, totalTransactions * 1.5);

    // +15 Punkte für gute Bewertungen
    if (reviews.length > 0) {
      score += (avgRating / 5) * 15;
    }

    // +10 Punkte für Account-Alter (1 Punkt pro 10 Tage, max 10)
    score += Math.min(10, accountAge / 10);

    // -20 Punkte pro aktivem Report
    score -= activeReports * 20;

    // Begrenzen auf 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      factors: {
        totalTransactions,
        avgRating: avgRating.toFixed(1),
        accountAge,
        activeReports,
        reviewCount: reviews.length
      }
    };
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return { score: 50, factors: {} };
  }
}

/**
 * Empfiehlt eine Versandvariante basierend auf verschiedenen Faktoren
 */
export function recommendShippingVariant(data) {
  const {
    user1TrustScore,
    user2TrustScore,
    product1Value,
    product2Value,
    user1Transactions,
    user2Transactions
  } = data;

  let score = 0;
  const factors = {};

  // Trust-Scores prüfen
  const minTrustScore = Math.min(user1TrustScore, user2TrustScore);
  factors.minTrustScore = minTrustScore;
  
  if (minTrustScore >= 70) {
    score += 40;
  } else if (minTrustScore >= 50) {
    score += 20;
  } else {
    score -= 30;
  }

  // Transaktionshistorie
  const minTransactions = Math.min(user1Transactions, user2Transactions);
  factors.minTransactions = minTransactions;
  
  if (minTransactions >= 10) {
    score += 30;
  } else if (minTransactions >= 5) {
    score += 15;
  } else if (minTransactions < 3) {
    score -= 20;
  }

  // Artikelwert
  const maxValue = Math.max(product1Value, product2Value);
  factors.maxValue = maxValue;
  
  if (maxValue < 30) {
    score += 30;
  } else if (maxValue < 50) {
    score += 10;
  } else if (maxValue > 100) {
    score -= 40;
  } else {
    score -= 20;
  }

  // Empfehlung: Ab Score 50 → Direct Tracking, darunter → Fulfillment
  const recommended = score >= 50 ? 'direct_tracking' : 'fulfillment';
  const confidence = Math.abs(score) / 100;

  factors.calculatedScore = score;

  return {
    recommended,
    confidence: Math.min(1, confidence),
    factors,
    reasoning: generateReasoning(recommended, factors)
  };
}

function generateReasoning(variant, factors) {
  const reasons = [];

  if (variant === 'direct_tracking') {
    if (factors.minTrustScore >= 70) {
      reasons.push('Beide Nutzer haben hohe Vertrauenswürdigkeit');
    }
    if (factors.minTransactions >= 5) {
      reasons.push('Ausreichend Transaktionserfahrung vorhanden');
    }
    if (factors.maxValue < 30) {
      reasons.push('Geringer Artikelwert');
    }
  } else {
    if (factors.minTrustScore < 50) {
      reasons.push('Mindestens ein Nutzer hat niedrigen Trust-Score');
    }
    if (factors.minTransactions < 3) {
      reasons.push('Geringe Transaktionserfahrung');
    }
    if (factors.maxValue > 50) {
      reasons.push('Hoher Artikelwert erfordert Absicherung');
    }
  }

  return reasons;
}