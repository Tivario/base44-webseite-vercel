import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const authStatusConfig = {
  nicht_geprueft: {
    label: 'Nicht geprüft',
    shortLabel: 'Ungeprüft',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: Shield,
    description: 'Dieser Artikel wurde noch nicht auf Echtheit geprüft.',
  },
  in_pruefung: {
    label: 'In Prüfung',
    shortLabel: 'In Prüfung',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    description: 'Dieser Artikel wird derzeit auf Echtheit geprüft.',
  },
  verifiziert: {
    label: 'Original bestätigt',
    shortLabel: 'Verifiziert',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Die Echtheit dieses Artikels wurde geprüft und bestätigt.',
  },
  verdaechtig: {
    label: 'Verdächtig',
    shortLabel: 'Verdächtig',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertTriangle,
    description: 'Achtung: Dieser Artikel wurde als verdächtig eingestuft.',
  },
  abgelehnt: {
    label: 'Als Fälschung erkannt',
    shortLabel: 'Fake',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    description: 'Dieser Artikel wurde als Fälschung identifiziert.',
  },
};

export default function AuthBadge({ status, size = 'default', showDescription = false }) {
  if (!status || status === 'nicht_geprueft') return null;

  const config = authStatusConfig[status] || authStatusConfig.nicht_geprueft;
  const Icon = config.icon;

  if (size === 'small') {
    return (
      <Badge className={`${config.color} border gap-1 text-xs`}>
        <Icon className="w-3 h-3" />
        {config.shortLabel}
      </Badge>
    );
  }

  if (size === 'large') {
    return (
      <div className={`${config.color} border-2 rounded-xl p-4 flex items-start gap-3`}>
        <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold mb-1">{config.label}</p>
          {showDescription && (
            <p className="text-sm opacity-80">{config.description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Badge className={`${config.color} border gap-1.5`}>
      <Icon className="w-4 h-4" />
      {config.shortLabel}
    </Badge>
  );
}