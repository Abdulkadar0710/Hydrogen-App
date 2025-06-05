import { Outlet, useParams } from '@remix-run/react';
import { useEffect } from 'react';
import i18n from '~/i18n';

export default function LanguageLayout() {
  const { lang } = useParams();
  console.log('LanguageLayout lang:', lang);

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);


  return <Outlet />;
}
