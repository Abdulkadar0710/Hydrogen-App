import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";

import { useTranslation } from 'react-i18next';
import i18n from '~/i18n';

// import ChangeData from '~/routes/ChangeData';


  export default function AddToCart() {

    const { t } = useTranslation('common');

    useEffect(() => {
        i18n.changeLanguage('en'); 
    }, []);

   return (
    <div >Add To Cart {t('FilterOptions.category')} 
    {/* < ChangeData lang="en" /> */}
    </div>
   )
  }  