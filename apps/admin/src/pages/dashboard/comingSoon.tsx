interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="vc-wordmark text-xs text-gold-700">In progress</p>
    <h1 className="mt-3 font-serif text-4xl text-primary-900">{title}</h1>
    <p className="mt-2 max-w-md text-sm text-gray-500">
      {description ?? 'This module is part of the next implementation phase.'}
    </p>
  </div>
);

export default ComingSoon;
