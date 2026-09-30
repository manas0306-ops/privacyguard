/**
 * Hindi Voice Assistant Localization & Synonym Maps
 */

import { PageId } from '../routeRegistry';

export const hiLocalization = {
  strings: {
    'nav.opening': '{page} खोला जा रहा है।',
    'nav.opening_object': '{object} सहमति खोली जा रही है।',
    'nav.showing_filtered': '{count} {filter} अनुमतियाँ दिखाई जा रही हैं।',
    'nav.already_there': 'आप पहले से ही {page} पर हैं।',
    'nav.going_back': '{page} पर वापस जा रहे हैं।',
    'nav.no_history': 'कोई पिछला पृष्ठ नहीं है। कुछ नहीं बदला।',
    'nav.ambiguous': 'आप क्या खोलना चाहते हैं: {options}?',
    'nav.unsupported_with_list':
      'मैं डैशबोर्ड, मेरा डेटा, सहमति केंद्र, सिम्युलेटर, डेटा प्रवाह, ऑडिट लॉग, सुरक्षा केंद्र या कोपायलट खोल सकता हूँ।',
    'nav.object_not_found': 'वह आइटम नहीं मिला। आप अभी भी {currentPage} पर हैं।',
    'nav.router_failed': '{page} नहीं खोला जा सका। आप अभी भी {currentPage} पर हैं।',
    'nav.filter_dropped': 'मैंने {page} खोल दिया लेकिन वह फ़िल्टर लागू नहीं किया जा सका।',
    'nav.compound_followup': '{page} खोला गया। कुछ भी नहीं बदला है। क्या वह बदलाव तैयार करूँ?',
    'nav.pending_action': 'आपकी एक कार्रवाई लंबित है। पहले पुष्टि या रद्द करें।',
    'nav.cancelled_action': 'कार्रवाई रद्द कर दी गई। कोई बदलाव नहीं किया गया।',
  },

  pageNames: {
    dashboard: 'डैशबोर्ड',
    my_data: 'मेरा डेटा',
    consent_center: 'सहमति केंद्र',
    request_simulator: 'अनुरोध सिम्युलेटर',
    data_flow: 'डेटा प्रवाह',
    audit_log: 'ऑडिट लॉग',
    security_center: 'सुरक्षा केंद्र',
    privacy_copilot: 'प्राइवेसी कोपायलट',
  } as Record<PageId, string>,

  pageSynonyms: [
    { synonyms: ['डैशबोर्ड', 'होम', 'मुख्य पृष्ठ'], pageId: 'dashboard' as PageId },
    { synonyms: ['मेरा डेटा', 'व्यक्तिगत डेटा', 'डेटा सूची', 'डेटा इन्वेंटरी'], pageId: 'my_data' as PageId },
    { synonyms: ['सहमति केंद्र', 'सहमति पेज', 'अनुमतियाँ', 'सहमति प्रबंधन', 'कंसेंट सेंटर'], pageId: 'consent_center' as PageId },
    { synonyms: ['अनुरोध सिम्युलेटर', 'सिम्युलेटर', 'जाँच सिम्युलेटर'], pageId: 'request_simulator' as PageId },
    { synonyms: ['डेटा प्रवाह', 'डेटा फ्लो', 'डेटा मैप', 'फ्लो मैप'], pageId: 'data_flow' as PageId },
    { synonyms: ['ऑडिट लॉग', 'ऑडिट लॉग्स', 'गतिविधि लॉग', 'इतिहास'], pageId: 'audit_log' as PageId },
    { synonyms: ['सुरक्षा केंद्र', 'सुरक्षा', 'सिक्योरिटी सेंटर'], pageId: 'security_center' as PageId },
    { synonyms: ['प्राइवेसी कोपायलट', 'कोपायलट', 'सहायक', 'प्राइवेसी असिस्टेंट'], pageId: 'privacy_copilot' as PageId },
  ],

  filterSynonyms: {
    risk: {
      CRITICAL: ['गंभीर जोखिम'],
      HIGH: ['उच्च जोखिम', 'खतरनाक'],
      MEDIUM: ['मध्यम जोखिम'],
      LOW: ['कम जोखिम'],
    },
    status: {
      active: ['सक्रिय', 'चालू'],
      withdrawn: ['वापस लिया गया', 'हटाया गया'],
      blocked: ['अवरुद्ध', 'ब्लॉक'],
    },
  },

  backPhrases: ['वापस जाओ', 'पीछे जाओ', 'पिछला पेज', 'पिछला पृष्ठ'],
  confirmLexicon: ['हाँ', 'पुष्टि करें', 'स्वीकार', 'ठीक है', 'आगे बढ़ें', 'करें'],
  cancelLexicon: ['नहीं', 'रद्द करें', 'रद्द', 'रुकें', 'रहने दो'],
  anaphoraPhrases: ['इसकी समीक्षा करें', 'दिखाओ', 'खोलो इसे', 'वहाँ ले चलो', 'देखें'],
};
