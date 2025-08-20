'use client';

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

export default function DownloadButton({ disabled, onClick }: Props) {
  return (
    <button
      className="btn"
      onClick={onClick}
      disabled={disabled}
      style={{ width: '100%', marginTop: 16 }}
    >
      Save PNG
    </button>
  );
}
