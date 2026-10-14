import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, changeTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'dark', icon: Moon, label: 'Gelap' },
    { value: 'system', icon: Monitor, label: 'Sistem' },
  ];

  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => changeTheme(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition ${
            theme === value
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          title={label}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
