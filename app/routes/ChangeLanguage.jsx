import { useState } from 'react';
import i18n from '~/i18n';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function ChangeLanguage() {
  const [open, setOpen] = useState(false);

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    console.log(i18n.language); // Log the current language
    console.log(i18n);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Change Language
          <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div
          className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            <button
              onClick={() => changeLang('en')}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              English
            </button>
            <button
              onClick={() => changeLang('fr')}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              Français
            </button>
            <button
              onClick={() => changeLang('hi')}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              Hindi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
