import { useEffect } from 'react';
import i18n from '~/i18n';

export default function LanguageLayout(props) {
  
  console.log('LanguageLayout props:', props);

  useEffect(() => {
    if (props.lang && i18n.language !== props.lang) {
      console.log('Changing language to:', props.lang);
      i18n.changeLanguage(String(props.lang));
    }
  }, [props.lang]);


  return <div>hello</div>;
}
