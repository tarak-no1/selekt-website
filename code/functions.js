'use strict'

const express = require('express');
const mappings = require('./mapping');

process.on('uncaughtException', function (error) {
    console.log(error.stack);
});
const fs = require('fs');
const jsonFile = require('jsonfile');
const elasticSearch = require('./elasticSearch.js');
const sessions = require('./sessions.js');
const pick_broad_occasion =
{
    "women_dresses":JSON.parse(fs.readFileSync('./product_lines/dresses_flow.json', 'utf8')),
    "women_kurta":JSON.parse(fs.readFileSync('./product_lines/kurta_flow.json', 'utf8')),
    "women_casual_shoes":JSON.parse(fs.readFileSync('./product_lines/casual_shoes_flow.json', 'utf8')),
    "women_flats":JSON.parse(fs.readFileSync('./product_lines/flats_flow.json', 'utf8')),
    "women_handbags":JSON.parse(fs.readFileSync('./product_lines/handbags_flow.json', 'utf8')),
    "women_heels":JSON.parse(fs.readFileSync('./product_lines/heels_flow.json', 'utf8')),
    "women_jackets":JSON.parse(fs.readFileSync('./product_lines/jackets_flow.json', 'utf8')),
    "women_jeans":JSON.parse(fs.readFileSync('./product_lines/jeans_flow.json', 'utf8')),
    "women_tops":JSON.parse(fs.readFileSync('./product_lines/tops_flow.json', 'utf8')),
    "women_tshirts":JSON.parse(fs.readFileSync('./product_lines/tshirts_flow.json', 'utf8')),

    "women_shirts":JSON.parse(fs.readFileSync('./product_lines/shirts_flow.json', 'utf8')),
    "women_shorts":JSON.parse(fs.readFileSync('./product_lines/shorts_flow.json', 'utf8')),
    "women_skirts":JSON.parse(fs.readFileSync('./product_lines/skirts_flow.json', 'utf8')),
    "women_sweaters":JSON.parse(fs.readFileSync('./product_lines/sweaters_flow.json', 'utf8')),
    "women_sweatshirts":JSON.parse(fs.readFileSync('./product_lines/sweatshirts_flow.json', 'utf8')),
    "women_trousers":JSON.parse(fs.readFileSync('./product_lines/trousers_flow.json', 'utf8')),
    "women_capris":JSON.parse(fs.readFileSync('./product_lines/capris_flow.json', 'utf8')),
    "women_jeggings":JSON.parse(fs.readFileSync('./product_lines/jeggings_flow.json', 'utf8')),
    "women_jumpsuits":JSON.parse(fs.readFileSync('./product_lines/jumpsuits_flow.json', 'utf8')),
    "women_blazers":JSON.parse(fs.readFileSync('./product_lines/blazers_flow.json', 'utf8'))
};
const profile_benefits =
{
    "women_kurta": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give  you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half and highlight the waist giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_casual_shoes": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "",
            "reason": ""
        },
        "39+": {
            "benefit": "classic_graceful_fit",
            "reason": "which are classic, graceful and encorporating the applicable trends. Focus on good fit"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "taller_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "taller_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "bright_colored",
            "reason": "with detailing and bright colors that will take away the attention from mid section"
        },
        "rectangle": {
            "benefit": "curvy_appearance",
            "reason": "that are curvy looking to give a curvy appearance to your body shape"
        },
        "pear": {
            "benefit": "bright_colored",
            "reason": "with detailing and bright colors that will take away the attention from lower half"
        },
        "hour glass": {
            "benefit": "elongated_appearance",
            "reason": "that will lengthen the leg line, giving a vertical appearance. Thus highlighting the curves better"
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
    "women_handbags": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "functional_trendy",
            "reason": "which more of functional use, lot of room but trendy as well"
        },
        "39+": {
            "benefit": "functional_trendy",
            "reason": "to show functional handbags, with a lot of room but trendy as well"
        },
        "tall": {
            "benefit": "balanced_height",
            "reason": "which are unstructured, slouchy with detailing giving a balanced appearance to the tall frame"
        },
        "average": {
            "benefit": "taller_appearance",
            "reason": "that are smaller in size comparatively giving your frame a taller appearance"
        },
        "short": {
            "benefit": "taller_appearance",
            "reason": "that are smaller in size comparatively giving your frame a taller appearance"
        },
        "apple": {
            "benefit": "slimmer_look",
            "reason": "which are thin, sleek to contradict your roundness and make you look slimmer/shapely"
        },
        "rectangle": {
            "benefit": "curvy_appearance",
            "reason": "that are unstructured, slouchy with detailing giving a curvy appearance to your body shape"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "with detailing that ends on waist to shift focus to upper body"
        },
        "hour glass": {
            "benefit": "curvy_appearance",
            "reason": "that are unstructured, slouchy with detailing giving a curvy appearance to your body shape"
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
    "women_flats": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "",
            "reason": ""
        },
        "39+": {
            "benefit": "classic_graceful_fit",
            "reason": "which are classic, graceful and encorporating the applicable trends. Focus on good fit"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "taller_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "taller_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "bright_colored",
            "reason": "with detailing and bright colors that will take away the attention from mid section"
        },
        "rectangle": {
            "benefit": "curvy_appearance",
            "reason": "that are curvy looking to give a curvy appearance to your body shape"
        },
        "pear": {
            "benefit": "bright_colored",
            "reason": "with detailing and bright colors that will take away the attention from lower half"
        },
        "hour glass": {
            "benefit": "elongated_appearance",
            "reason": "that will lengthen the leg line, giving a vertical appearance. Thus highlighting the curves better"
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
    "women_jackets": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give  you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half and highlight the waist giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_tops": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give  you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half and highlight the waist giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_dresses": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give  you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half and highlight the waist giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_jeans": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "proportionate_legs",
            "reason": "which will make your legs look broader and hence appear proportionate with your mid section and give that shapey/Slimmer look"
        },
        "rectangle": {
            "benefit": "curvy_legs",
            "reason": "that are figure hugging, making your legs look shapy. Brings out the curves."
        },
        "pear": {
            "benefit": "slim_legs",
            "reason": "that will take away the attention from your thighs and gives you a slimmer look"
        },
        "hour glass": {
            "benefit": "waist_fitting",
            "reason": "that flares and sits perfectly at waist highlighting those perfect curves"
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
    "women_tshirts": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give  you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half and highlight the waist giving a balanced shape"
        },
        "hour glass": {
            "benefit": "tight_fitting",
            "reason": "that are tight fitting to highlight the perfect figure"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_heels": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "",
            "reason": ""
        },
        "39+": {
            "benefit": "classic_graceful_fit",
            "reason": "which are classic, graceful and encorporating the applicable trends. Focus on good fit"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "taller_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "taller_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "bright_colored",
            "reason": "with detailing and bright colors that will take away the attention from mid section"
        },
        "rectangle": {
            "benefit": "curvy_appearance",
            "reason": "that are curvy looking to give a curvy appearance to your body shape"
        },
        "pear": {
            "benefit": "bright_colored",
            "reason": "with detailing and bright colors that will take away the attention from lower half"
        },
        "hour glass": {
            "benefit": "elongated_appearance",
            "reason": "that will lengthen the leg line, giving a vertical appearance. Thus highlighting the curves better"
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
   
    "women_shirts": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half, highlight the waist and make the top half look proportionate giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_skirts": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "proportionate_legs",
            "reason": "which will make your legs look broader and hence appear proportionate with your mid section and give that shapey/Slimmer look"
        },
        "rectangle": {
            "benefit": "curvy_legs",
            "reason": "that are figure hugging, making your legs look shapy. Brings out the curves."
        },
        "pear": {
            "benefit": "slim_legs",
            "reason": "with silhouette that will take away the attention from lower half and give a slimmer look"
        },
        "hour glass": {
            "benefit": "waist_fitting",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_trousers": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "proportionate_legs",
            "reason": "which will make your legs look broader and hence appear proportionate with your mid section and give that shapey/Slimmer look"
        },
        "rectangle": {
            "benefit": "curvy_legs",
            "reason": "that are figure hugging, making your legs look shapy. Brings out the curves."
        },
        "pear": {
            "benefit": "slim_legs",
            "reason": "with silhouette that will take away the attention from lower half and give a slimmer look"
        },
        "hour glass": {
            "benefit": "waist_fitting",
            "reason": "that flares and sits perfectly at waist highlighting those perfect curves"
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
    "women_sweatshirts": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half, highlight the waist and make the top half look proportionate giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_sweaters": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half, highlight the waist and make the top half look proportionate giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_shorts": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "proportionate_legs",
            "reason": "which will make your legs look broader and hence appear proportionate with your mid section and give that shapey/Slimmer look"
        },
        "rectangle": {
            "benefit": "curvy_legs",
            "reason": "that are figure hugging, making your legs look shapy. Brings out the curves."
        },
        "pear": {
            "benefit": "slim_legs",
            "reason": "with dark colors that will take away the attention from lower half and will give you a slimmer look"
        },
        "hour glass": {
            "benefit": "waist_fitting",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_jeggings": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "",
            "reason": ""
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "",
            "reason": ""
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "proportionate_legs",
            "reason": "which will make your legs look broader and hence appear proportionate with your mid section and give that shapey/Slimmer look"
        },
        "rectangle": {
            "benefit": "",
            "reason": ""
        },
        "pear": {
            "benefit": "slim_legs",
            "reason": "with dark colors that will take away the attention from lower half and will give you a slimmer look"
        },
        "hour glass": {
            "benefit": "",
            "reason": ""
        },
        "wheatish": {
            "benefit": "",
            "reason": ""
        },
        "dark": {
            "benefit": "",
            "reason": ""
        },
        "fair": {
            "benefit": "",
            "reason": ""
        }
    },
    "women_capris": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance to your legs and make you look taller"
        },
        "apple": {
            "benefit": "proportionate_legs",
            "reason": "which will make your legs look broader and hence appear proportionate with your mid section and give that shapey/Slimmer look"
        },
        "rectangle": {
            "benefit": "curvy_legs",
            "reason": "that are figure hugging, making your legs look shapy. Brings out the curves."
        },
        "pear": {
            "benefit": "slim_legs",
            "reason": "with dark colors that will take away the attention from lower half and will give you a slimmer look"
        },
        "hour glass": {
            "benefit": "waist_fitting",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_jumpsuits": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "classic_trendy",
            "reason": "which are trendy keeping your comfort zone in mind. Classic style would be Apt"
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half, highlight the waist and make the top half look proportionate giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    },
    "women_blazers": {
        "18-27": {
            "benefit": "",
            "reason": ""
        },
        "28-38": {
            "benefit": "",
            "reason": ""
        },
        "39+": {
            "benefit": "classic_graceful",
            "reason": "which are classic, graceful and encorporating the applicable trends"
        },
        "tall": {
            "benefit": "complement_height",
            "reason": "that will not make your frame look shorter but anything that will complement or elongate your frame"
        },
        "average": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "short": {
            "benefit": "elongated_appearance",
            "reason": "that will give an elongated appearance and make you look taller"
        },
        "apple": {
            "benefit": "even_shape",
            "reason": "which divert attention from your mid section, evens out the body shape and gives a slimmer or shapey look"
        },
        "rectangle": {
            "benefit": "thinner_waist",
            "reason": "that draw attention to your waist, make it appear thinner and give you that curvy look"
        },
        "pear": {
            "benefit": "proportionate_top",
            "reason": "that will draw attention to the upper half and highlight the waist giving a balanced shape"
        },
        "hour glass": {
            "benefit": "defining_waist",
            "reason": "that will highlight your perfect body shape by defining your waist. This will flaunt your curves"
        },
        "wheatish": {
            "benefit": "complement_wheatish",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "dark": {
            "benefit": "complement_dark",
            "reason": "that will not overpower your skin tone but will complement it"
        },
        "fair": {
            "benefit": "complement_fair",
            "reason": "that will not overpower your skin tone but will complement it"
        }
    }
};
const benefit_name=
{
    "women_kurta": {
        //Profile Benefit Names
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",

        //other than benefits
        "comfortable_look": "Casual Look",
        "less_blingy_look": "For Birthday/Anniversary",
        "graceful_look": "For Wedding",
        "chic_look": "For Special Occasion",
        "dressy_look": "Casual Look",
        "trendy_look": "For Daily Wear/College",
        "professional_look": "Formal Look",
        "smart_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "night_look": "For Night Events",
        "simple_look": "Special Occasions - Simple",
        "heavy_look": "Special Occasions - Heavy",
        "breatheable_feel": "For Hot Weather",
        "cozy_feel": "Warm",
        "day_look": "For Day Events",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look",
        "intermediate_look": ""
    },
    "women_casual_shoes": {
        //profile benefits
        "classic_graceful_fit": "Suits your age",
        "complement_height": "Complements Height",
        "taller_appearance": "Tall Look",
        "bright_colored": "Slim Look",
        "curvy_appearance": "Curvy Look",
        "elongated_appearance": "Highlights Curves",
        //other than profile benfits
        "professional_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "classy_regular_look": "Casual Look",
        "all_season_use": "Beach Wear",
        "functional_look": "Casual Look",
        "classy_delicate_look": "Party Wear",
        "blingy_look": "For Clubbing/House Party",
        "warm_feel": "For Winter",
        "colorful_look": "Colorful",
        "bright_look": "Bright Color",
        "classic_look": "Elegant Color",
        "charming_look": "Subtle Color",
        "dressy": "Dressy Look",
        "cute": "Cute Look",
        "blingy": "Simple Look"
    },
    "women_handbags": {
        //profile benefits
        "functional_trendy": "Suits your age",
        "balanced_height": "Complements Height",
        "taller_appearance": "Tall Look",
        "slimmer_look": "Slim Look",
        "curvy_appearance": "Curvy Look",
        "proportionate_top": "Proportionate Shape",

        //other than profile benefits
        "classy_regular_look": "Casual Look",
        "cool_big_look": "Casual Look",
        "experimental_look": "For Holiday Trips",
        "washable_big_use": "For Beach Use",
        "classy_minimal_look": "For College Party",
        "blingy_minimal_look": "For Clubbing/House Party",
        "detailing_look": "Party Wear",
        "professional_look": "Formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "functional": "Roomy Bags",
        "functional_small": "Bags for Essentials",
        "aesthetic": "Good Look",
        "fuctional_aesthetic": "Functional & Good Look",
        "colorful_look": "Colorful",
        "bright_look": "Bright Color",
        "classic_look": "Elegant Color",
        "charming_look": "Subtle Color"
    },
    "women_flats": {
        //profile benefits
        "classic_graceful_fit": "Suits your age",
        "complement_height": "Complements Height",
        "taller_appearance": "Tall Look",
        "bright_colored": "Slim Look",
        "curvy_appearance": "Curvy Look",
        "elongated_appearance": "Highlights Curves",

        //other than profile benefits
        "classy_regular_look": "Casual Look",
        "functional_look": "Casual Look",
        "all_season_use": "Beach Wear",
        "classy_delicate_look": "Party Wear",
        "blingy_sturdy_look": "Party Wear",
        "detailing_look": "For Special Occasion",
        "detailing_blingy_look": "For Festival/Weddings",
        "professional_look": "Formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "dressy": "Dressy Look",
        "cute": "Cute Look",
        "simple": "Simple Look",
        "colorful_look": "Colorful",
        "bright_look": "Bright Color",
        "classic_look": "Elegant Color",
        "charming_look": "Subtle Color"
    },
    "women_jackets": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",

        //other than profile benefits
        "sporty_look": "For Workout",
        "professional_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "dressy_look": "Casual Look",
        "trendy_look": "Casual Look",
        "classy_delicate_look": "Party Wear",
        "less_blingy_look": "For Birthday/Anniversary/Date",
        "detailed_look": "Party Wear",
        "all_season_use": "",
        "cozy_feel": "For Mild Cold",
        "warm_feel": "For Moderate Cold",
        "functional_look": "For Extreme Cold",
        "wind_resistant": "For Windy Conditions",
        "water_resistant": "For Rainy Conditions",
        "lightweight_feel": "Lightweight",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful"
    },
    "women_tops": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //other than profile benefits
        "comfortable_look": "",
        "moderately_blingy_look": "For Special Occasion",
        "graceful_look": "For Festivals",
        "professional_look": "Formal Look",
        "smart_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "dressy_look": "Casual Look",
        "trendy_look": "Casual Look",
        "breezy_look": "For Beach/Pool Party",
        "experimental_look": "For Holiday Trips",
        "less_blingy_look": "For College Party",
        "chic_look": "Party Wear",
        "detailed_look": "For House Party",
        "blingy_look": "",
        "simple_look": "Special Occasions - Simple",
        "heavy_look": "Special Occasions - Heavy",
        "breatheable_feel": "For Hot Weather",
        "cozy_feel": "Warm",
        "day_look": "For Day Events",
        "night_look": "For Night Events",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look",
        "intermediate_look": ""
    },
    "women_dresses": {
        //profile_benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",

        //other than profile_benefits
        "breezy_look": "For Beach/Pool Party",
        "professional_look": "Formal Look",
        "smart_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look",
        "intermediate_look": "",
        "breatheable_feel": "All Season Wear",
        "cozy_feel": "Warm",
        "dressy_look": "Casual Look",
        "trendy_look": "Casual Look",
        "simple_look": "Wedding - Simple",
        "heavy_look": "Wedding - Heavy",
        "night_look": "For Night Events",
        "chic_look": "Party Wear",
        "detailed_look": "Party Wear",
        "less_blingy_look": "For Birthday/Anniversary",
        "day_look": "For Day Events"
    },
    "women_jeans": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "proportionate_legs": "Slim Look",
        "curvy_legs": "Curvy Look",
        "slim_legs": "Proportionate Shape",
        "waist_fitting": "Highlights Curves",

        //other than profile benefits
        "comfortable_look": "Casual Look",
        "professional_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "dressy_look": "For Birthday/Anniversary/Date",
        "chic_look": "Party Wear",
        "detailed_look": "Party Wear",
        "powerful_look": "Blacks",
        "feminine_look": "Blues",
        "relaxing_look": "Light Colored",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look",
        "intermediate_look": ""
    },
    "women_tshirts": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "tight_fitting": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //other than profile benefits
        "comfortable_look": "Casual Look",
        "sporty_look": "Sports Wear",
        "professional_look": "Office Casual Look",
        "dressy_look": "Casual Look",
        "trendy_look": "For Daily Wear/College",
        "experimental_look": "For Holiday Trips",
        "loose_fit_sporty": "For Indoor Activities",
        "tight_fit_sporty": "For Outdoor Activities",
        "blingy_look": "For Indoor Events",
        "breatheable_feel": "For Hot Weather",
        "cozy_feel": "Warm",
        "day_look": "For Day Events",
        "night_look": "For Night Events",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look",
        "intermediate_look": "",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "detailed_look": "Party Wear",
        "less_blingy_look": "Party Wear"
    },
    "women_heels": {
        //profile benefits
        "classic_graceful_fit": "Suits your age",
        "complement_height": "Complements Height",
        "taller_appearance": "Tall Look",
        "bright_colored": "Slim Look",
        "curvy_appearance": "Curvy Look",
        "elongated_appearance": "Highlights Curves",

        //other than profile benefits
        "classy_regular_look": "Casual Look",
        "functional_look": "Casual Look",
        "all_season_use": "Beach Wear",
        "classy_delicate_look": "Party Wear",
        "blingy_sturdy_look": "Party Wear",
        "detailing_look": "For Special Occasion",
        "detailing_blingy_look": "For Festival/Weddings",
        "professional_look": "Formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "dressy": "Dressy Look",
        "cute": "Cute Look",
        "simple": "Simple Look",
        "colorful_look": "Colorful",
        "bright_look": "Bright Color",
        "classic_look": "Elegant Color",
        "charming_look": "Subtle Color"
    },
    
    "women_shirts": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //non profile benefits
        "professional_look": "Formal Look",
        "smart_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "detailed_look": "All Season Wear",
        "elegant_looks": "For Lunch/Brunch/Dinner/Movie",
        "trendy_look": "For Daily Wear/College",
        "experimental_look": "For Holiday Trips",
        "breezy_look": "Beach Wear",
        "stylish_looks": "Casual Look",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look",
        "intermediate_look": ""
    },
    "women_skirts": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "proportionate_legs": "Slim Look",
        "curvy_legs": "Curvy Look",
        "slim_legs": "Proportionate Shape",
        "waist_fitting": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",

        //non profile benefits
        "professional_look": "Formal Look",
        "smart_look": "For Cocktail/Office Party",
        "comfortable_stylish_feel": "Office Casual Look",
        "breatheable_feel": "For Lunch/Brunch/Dinner/Movie",
        "cozy_feel": "For Daily Wear/College",
        "beach_looks": "Beach Wear",
        "alluring_look": "For Holiday Trips",
        "beauty_looks": "For a Date",
        "elegant_look": "Casual Look",
        "clubbing_look": "For Clubbing/House Party",
        "voguish_look": "For College Party",
        "classy_look": "For Birthday/Anniversary",
        "poolparty_look": "For Pool Party",
        "sophisticated_look": "Party Look",
        "conservative_look": "Modest Look",
        "bold_looks": "Bold Look",
        "blingy_look": "For Night Events",
        "day_look": "For Day Events",
        "hot_skirt": "For Hot Weather",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "intermediate_look": ""
    },
    "women_trousers": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "proportionate_legs": "Slim Look",
        "curvy_legs": "Curvy Look",
        "slim_legs": "Proportionate Shape",
        "waist_fitting": "Highlights Curves",
        //non profile benefits
        "professional_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "beach_looks": "Beach Wear",
        "elegant_look": "For Lunch/Brunch/Dinner/Movie",
        "trendy_look": "For Daily Wear/College",
        "experimental_look": "For Holiday Trips",
        "sophisticated_look": "Casual Look",
        "chic_look": "For Office Party",
        "voguish_look": "For College Party",
        "classy_look": "For Birthday/Anniversary",
        "party_look": "Party Look",
        "alluring_look": "For Night Events",
        "day_look": "For Day Events",
        "breathable_feel": "For Hot Weather",
        "warm_looks": "Warm",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful"
    },
    "women_shorts": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "proportionate_legs": "Slim Look",
        "curvy_legs": "Curvy Look",
        "slim_legs": "Proportionate Shape",
        "waist_fitting": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //non profile benefits
        "sporty_looks": "Sports Wear",
        "beach_looks": "Beach Wear",
        "elegant_look": "For Lunch/Brunch/Dinner/Movie",
        "trendy_look": "For Daily Wear/College",
        "experimental_look": "For Holiday Trips",
        "sophisticated_look": "Casual Look",
        "poolparty_look": "For Pool Party",
        "clubbing_look": "For Clubbing/House Party",
        "voguish_look": "For College Party",
        "party_look": "Party Look",
        "alluring_look": "For Night Events",
        "day_look": "For Day Events",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "intermediate_look": "Moderately Bold"
    },
    "women_sweatshirts": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //non profile benefits
        "active_look": "Active/Sports Wear",
        "trendy_look": "Daily Wear",
        "voguish_look": "College wear",
        "classy_look": "For Lunch/Brunch/Movie",
        "elegant_look": "Casual Look",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "conservative_look": "Modest Look"
    },
    "women sweaters": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //non profile benefits
        "comfortable_stylish_feel": "Office Wear",
        "trendy_look": "Daily Casual",
        "voguish_look": "College wear",
        "classy_look": "Casual Look",
        "cozy_feel": "For Holiday Trips",
        "dressy_look": "For Special Events",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
    },
    "women_capris": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "proportionate_legs": "Slim Look",
        "curvy_legs": "Curvy Look",
        "slim_legs": "Proportionate Shape",
        "waist_fitting": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",

        //non profile benefits
        "beach_looks": "Beach Wear",
        "elegant_look": "For Lunch/Brunch/Dinner/Movie",
        "trendy_look": "For Daily Wear/College",
        "experimental_look": "For Holiday Trips",
        "sophisticated_look": "Casual Look",
        "day_look": "For Day Events",
        "alluring_look": "For Night Events",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful",
        "daring_look": "Bold Look",
        "intermediate_look": "Moderately Bold"
    },
    "women_jeggings": {
        //profile benefits
        "classic_graceful": "Suits your age",
        "elongated_appearance": "Tall Look",
        "proportionate_legs": "Slim Look",
        "slim_legs": "Proportionate Shape",
        //non profile benefits
        "comfortable_stylish_feel": "Office Wear",
        "voguish_look": "For Daily Wear/College",
        "beauty_looks": "For Holiday Trips",
        "elegant_look": "Casual Look",
        "clubbing_look": "For Clubbing/House Party",
        "alluring_look": "For Birthday/Anniversary",
        "party_look": "Party Look",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful"
    },
    "women_jumpsuits": {
        //profile benefits
        "classic_trendy": "Suits your age",
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //non profile benefits
        "comfortable_stylish_feel": "Office Casual Look",
        "elegant_look": "For Lunch/Brunch/Dinner/Movie",
        "beach_look": "Beach Wear",
        "trendy_look": "For Daily Wear/College",
        "alluring_look": "For Holiday Trips",
        "date_look": "For a Date",
        "voguish_look": "Casual Look",
        "allseason_yes": "All Season Wear",
        "clubbing_look": "For Clubbing/House Party",
        "stylish_look": "For Birthday/Anniversary",
        "party_look": "Party Look",
        "sophisticated_look": "For Night Events",
        "day_look": "For Day Events",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful"
    },
    "women_blazers": {
        //profile benefits
        "classic_graceful": "Suits your age",
        "complement_height": "Complements Height",
        "elongated_appearance": "Tall Look",
        "even_shape": "Slim Look",
        "thinner_waist": "Curvy Look",
        "proportionate_top": "Proportionate Shape",
        "defining_waist": "Highlights Curves",
        "complement_wheatish": "For Wheatish Skin",
        "complement_dark": "For Dark Skin",
        "complement_fair": "For Fair Skin",
        //non profile benefits
        "comfortable_look": "Casual Look",
        "professional_look": "Semi-formal Look",
        "comfortable_stylish_feel": "Office Casual Look",
        "classy_delicate_look": "Party Wear",
        "less_blingy_look": "For Birthday/Anniversary/Date",
        "detailed_look": "Party Wear",
        "warm_feel": "For Hot Weather",
        "functional_look": "Warm",
        "powerful_look": "Powerful Color",
        "feminine_look": "Feminine Color",
        "bright_look": "Bright Color",
        "relaxing_look": "Relaxing Color",
        "colorful_look": "Colorful"
    }
};
function get_products(filters,remove_tags,product_line, benefits, from, is_flow_complete, callback) {

    let products_query = buildQuery(product_line, benefits, filters, remove_tags, from);

    console.log(JSON.stringify(products_query,null,2));
    // Fetching products
    fetching_products(products_query,benefits, product_line, is_flow_complete,function(res)
    {
        console.log("sending results");
        callback(res);
    });
}

function buildQuery(product_line, benefits,context_filters,remove_tags, from) {

    let filter_query = {
        bool: {
            must : [],
            must_not:[]
        }
    };
    //Context Filters
    let cnt_filters = {};
    for(let x in context_filters)
    {
        let attribute = Object.keys(context_filters[x])[0];
        if(attribute!="range")
        {
            if(cnt_filters[attribute] == undefined)
                cnt_filters[attribute] = [];
            cnt_filters[attribute].push(context_filters[x][attribute]);
        }
        else
        {
            filter_query.bool.must.push(context_filters[x])
        }
    }
    let cnt_keys = Object.keys(cnt_filters);
    for(let y in cnt_keys)
    {
        let output = {};
        output[cnt_keys[y]] = cnt_filters[cnt_keys[y]];
        filter_query.bool.must.push({"terms":output});
    }

    //Benefits
    let benefit_query = {
        "bool":{"must":[],"should":[]}
    };
    let imp_benefits_query = {"bool":{"should":[]}};

    let jsonFilter = {};
    let jsonAttributes = {};
    if(benefits.length>0)
        jsonFilter["benefits"] = [];
    for(let i in benefits) {
        let benefit_value = benefits[i].value;
        if(benefits[i].type=="benefit")
        {
            if(!benefits[i].important)
            {
                jsonFilter.benefits.push(benefit_value);
            }
            else
            {
                imp_benefits_query.bool.should.push({"terms":{"benefits":[benefit_value]}});
            }
        }
        else if(benefits[i].type!=undefined)
        {
            if(jsonAttributes["product_filter."+benefits[i].type]==undefined)
                jsonAttributes["product_filter."+benefits[i].type] = [];
            jsonAttributes["product_filter."+benefits[i].type].push(benefit_value);
        }
    }
    benefit_query.bool.must.push(imp_benefits_query);
    //attribute Types in Benefits
    let att_keys = Object.keys(jsonAttributes);
    for(let i in att_keys)
    {
        let output = {};
        output[att_keys[i]] = jsonAttributes[att_keys[i]];
        benefit_query.bool.should.push({"terms":output});
    }
    let ben_keys = Object.keys(jsonFilter);
    for(let i in ben_keys)
    {
        let output = {};
        output[ben_keys[i]] = jsonFilter[ben_keys[i]];
        output["boost"] = 3;
        benefit_query.bool.should.push({"terms":output});
    }
    filter_query.bool.must.push(benefit_query);

    //Remove Tags
    let jsonTags = {};
    for(let i in remove_tags)
    {
        if(jsonTags[remove_tags[i].key]==undefined)
            jsonTags[remove_tags[i].key] = [];
        jsonTags[remove_tags[i].key].push(remove_tags[i].value);
    }
    let tag_keys = Object.keys(jsonTags);
    for(let j in tag_keys)
    {
        let output = {};
        output["product_filter."+tag_keys[j]] = jsonTags[tag_keys[j]];
        filter_query.bool.must_not.push({"terms":output});
    }

    return {
        index: 'products_data',
        type: product_line,
        body: {
            query: filter_query },
        from:from*60,
        size: 200
    };
}

let fetching_products = function(products_query, benefits, product_line, is_flow_complete, callback)
{
    elasticSearch.runQuery(products_query, function (result_set,total,err)
    {
        if(err==null)
        {
            let result = [];
            result.push({"total":total,"is_flow_complete":is_flow_complete});
            console.log("results from elasticSearch");
            for(let i in result_set) {
                let result_source = result_set[i]["_source"];
                let source = {};
                source["_id"] = result_set[i]["_id"];
                source["product_filter"] = result_source["product_filter"];
                source["style_image"] = result_source["style_image"];
                source["landingPageUrl"] = result_source["pdpData"]["landingPageUrl"];
                source["product_benefits"] = [];
                try
                {
                    for(let pro_benefit in result_source["benefits"])
                    {
                        let name = functions.benefit_name[product_line][result_source["benefits"][pro_benefit]];
                        if(source["product_benefits"].indexOf(name)==-1 && name!="")
                        {
                            source["product_benefits"].push(name);
                        }
                    }
                }catch(e){}
                if(source["style_image"]==undefined)
                    source["style_image"] = result_source["style_images"];

                //getting least size image url
                let resolutions = function(source)
                {
                    let image_url;
                    let pixel,min_pixels;
                    try{
                        image_url = source["imageURL"];
                        let image_resolutions = source["resolutions"];
                        let res_keys = Object.keys(image_resolutions);
                        min_pixels = 2080;
                        let require_index = 0;
                        for(let res in res_keys)
                        {
                            pixel = parseInt(res_keys[res].split("X")[0]);
                            if(pixel>=360 && pixel<min_pixels)
                            {
                                min_pixels = pixel;
                                require_index = res;
                            }
                        }
                        image_url = image_resolutions[res_keys[require_index]];
                    }catch (e){console.log(e)}
                    return image_url;
                };

                let main_image_url,front_image_url,back_image_url,right_image_url,left_image_url;
                if(source["style_image"]!=undefined)
                {
                    if(source["style_image"].hasOwnProperty("search"))
                        main_image_url = resolutions(source["style_image"]["search"]);

                    if(source["style_image"].hasOwnProperty("front"))
                        front_image_url = resolutions(source["style_image"]["front"]);

                    if(source["style_image"].hasOwnProperty("back"))
                        back_image_url = resolutions(source["style_image"]["back"]);

                    if(source["style_image"].hasOwnProperty("right"))
                        right_image_url = resolutions(source["style_image"]["right"]);

                    if(source["style_image"].hasOwnProperty("left"))
                        left_image_url = resolutions(source["style_image"]["left"]);

                    source["style_image"] = {};
                    source["style_image"]["search"] = {};
                    if(main_image_url!=undefined)
                    {
                        source["style_image"]["search"]["imageURL"] = main_image_url;
                    }
                    if(left_image_url!=undefined)
                    {
                        source["style_image"]["left"] = {};
                        source["style_image"]["left"]["imageURL"] = left_image_url;
                        if(source["style_image"]["search"]["imageURL"]==undefined)
                            source["style_image"]["search"]["imageURL"] = left_image_url;
                    }
                    if(right_image_url!=undefined)
                    {
                        source["style_image"]["right"] = {};
                        source["style_image"]["right"]["imageURL"] = right_image_url;
                        if(source["style_image"]["search"]["imageURL"]==undefined)
                            source["style_image"]["search"]["imageURL"] = right_image_url;
                    }
                    if(front_image_url!=undefined)
                    {
                        source["style_image"]["front"] = {};
                        source["style_image"]["front"]["imageURL"] = front_image_url;
                        if(source["style_image"]["search"]["imageURL"]==undefined)
                            source["style_image"]["search"]["imageURL"] = front_image_url;
                    }
                    if(back_image_url!=undefined)
                    {
                        source["style_image"]["back"] = {};
                        source["style_image"]["back"]["imageURL"] = back_image_url;
                        if(source["style_image"]["search"]["imageURL"]==undefined)
                            source["style_image"]["search"]["imageURL"] = back_image_url;
                    }
                }


                //Benefits
                source["benefits"] = [];
                for(let ben in benefits)
                {
                    if(result_source["benefits"]!=undefined)
                    {
                        if(result_source["benefits"].indexOf(benefits[ben].value)==-1)
                        {
                            if(benefits[ben].type!="benefit" && source["product_filter"][benefits[ben].type]==benefits[ben].value && source["benefits"].indexOf(benefits[ben].value)==-1)
                            {
                                source["benefits"].push(benefits[ben].value);
                            }
                        }
                        else
                        {

                            if(benefit_name[product_line][benefits[ben].value]!=undefined) {
                                if (benefit_name[product_line][benefits[ben].value] != "")
                                    source["benefits"].push(benefit_name[product_line][benefits[ben].value]);
                            }
                            else
                                source["benefits"].push(benefits[ben].value);
                        }
                    }
                }
                source["benefit_percentage"] = Math.floor((source["benefits"].length/benefits.length)*10)*10;
                result.push(source);
            }
            callback(result);
        }
    });
}
function get_adjectives(product_list, product_line, callback) {
    let adjective_rules_query = {
        index: "styling_rules",
        type: "adjectives_rules",
        body: {
            query: {
                bool: {
                    must: {
                        match: {
                            product_line_name: product_line
                        }
                    }
                }
            }
        },
        size: 300
    };
    let total_adjective_list = [];
    let adjective_map = {};
    elasticSearch.runQuery(adjective_rules_query, function (adjective_rules,total) {

        console.log("Number of adjective rules", adjective_rules.length);
        for (let i = 0; i < product_list.length; i++) {
            let product = product_list[i];
            let adjective_list = [];
            for (let j = 0; j < adjective_rules.length; j++) {
                let rule = adjective_rules[j];
                let rule_attribute_dependency_list = rule["_source"]["attribute_dependencies"];
                let rule_satisfied = true;
                for (let k = 0; k < rule_attribute_dependency_list.length; k++) {

                    let attribute_name = rule_attribute_dependency_list[k]["attribute_type"];
                    let attribute_value_list = rule_attribute_dependency_list[k]["attribute_value"];
                    let product_attribute_value = fetch_attribute_value(attribute_name,product_line, product);

                    attribute_value_list.indexOf(product_attribute_value);

                    if (attribute_value_list.indexOf(product_attribute_value) < 0) {
                        rule_satisfied = false;
                        break;
                    }
                }

                if (rule_satisfied) {
                    let adjective_band = rule["_source"]['adjective_name'];
                    let adjective_value = rule["_source"]['adjective_value'];
                    if (!isKeyExists(adjective_band, adjective_map)) adjective_map[adjective_band] = {};
                    if (!isKeyExists(adjective_value, adjective_map[adjective_band])) adjective_map[adjective_band][adjective_value] = 0;
                    adjective_map[adjective_band][adjective_value] = adjective_map[adjective_band][adjective_value] + 1;
                    adjective_list.push(rule["_source"]['adjective_name'] + "_" + rule["_source"]['adjective_value']);
                }
            }
            total_adjective_list.push(adjective_list);
        }
        // console.log(JSON.stringify(adjective_map, null, 2));
        callback(total_adjective_list);
    });
}

function get_tags(product_line,benefits,remove_tags,callback) {
    let tags = [];
    let query = {
        index : "styling_rules",
        type : "benefit_rules",
        body:
        {
            query:{bool:{must:[
                {"bool": {"should": [{"match_phrase":{"product_line_name": product_line} }]}}
            ]}}
        }
    };

    let jsonQuery = {};
    jsonQuery.bool = {};
    jsonQuery.bool.should = [];
    let attributes = {};
    for(let i in benefits)
    {
        if(benefits[i].type=="benefit")
            jsonQuery.bool.should.push({"match_phrase":{"adjective_value":benefits[i].value}});
        else
        {
            if(attributes[benefits[i].type]==undefined)
                attributes[benefits[i].type]=[];
            attributes[benefits[i].type].push(benefits[i].value);
        }
    }
    query.body.query.bool.must.push(jsonQuery);
    let att_json = {};
    for(let i in remove_tags)
    {
        let tag = remove_tags[i];
        if(att_json[tag.key]==undefined)
            att_json[tag.key] = [];
        att_json[tag.key].push(tag.value);
    }
    elasticSearch.runQuery(query,function(data,total)
    {
        for(let k in data)
        {
            let source = data[k]._source;
            let dependances = source["attribute_dependencies"];
            for(let att in dependances)
            {
                let type = dependances[att].attribute_type;
                let values = dependances[att].attribute_value;
                if(attributes[type]==undefined)
                    attributes[type] = [];
               for(let val in values)
               {
                   if(attributes[type].indexOf(values[val])==-1)
                   {
                       if(att_json.hasOwnProperty(type) && att_json[type].indexOf(values[val])!=-1)
                       {
                            continue;
                       }
                       attributes[type].push(values[val]);
                   }
               }
            }
        }
        let keys = Object.keys(attributes);
        for(let i in keys)
        {
            tags.push({"key":keys[i], "values":attributes[keys[i]]});
        }
       callback(tags);
    });
}

function fetch_attribute_value(attribute_name,product_line, product) {
    let type = getType[product_line];
    let product_attribute_path = type["list"][attribute_name];
    let fields = product_attribute_path.split(".");
    let product_attribute_value;
    // console.log(product_attribute_path);
    // console.log(fields);
    if (fields.length == 3) {
        product_attribute_value = product[fields[0]][fields[1]][[fields[2]]];
    }
    if (fields.length == 2) {
        product_attribute_value = product[fields[0]][fields[1]];
    }
    return product_attribute_value;
}

function isKeyExists(key, json) {
    return !(!(key in json) || json[key] == null || json[key] == undefined);
}
const get_number =
{
    "women_dresses": {
        "office_wear": "1",
        "beach": "2",
        "casual_wear": "3",
        "wedding": "4",
        "party_wear": "5",
        "formal": "6",
        "semi_formal": "7",
        "casual": "8",
        "powerful_formal_color": "31",
        "feminine_formal_color": "32",
        "bright_formal_color": "33",
        "color_formal_none": "34",
        "powerful_color": "35",
        "feminine_color": "36",
        "bright_color": "37",
        "relax_color": "38",
        "colorful": "39",
        "color_casual_none": "40",
        "bold": "41",
        "modest": "42",
        "intermediate": "43",
        "bold_none": "44",
        "family": "9",
        "friends": "10",
        "hot": "11",
        "cold": "12",
        "lunch_type": "13",
        "daily_wear_type": "14",
        "casual_general": "15",
        "other_events_casual": "16",
        "season_yes": "17",
        "season_no": "18",
        "simple": "19",
        "heavy": "20",
        "indoor": "21",
        "outdoor": "22",
        "cocktail": "23",
        "clubbing": "24",
        "college_party": "25",
        "birthday": "26",
        "party_general": "27",
        "other_events_party": "28",
        "day": "29",
        "night": "30",
        "pool_party_pool_party": "2",
        "casual_office": "8",
        "summer": "11",
        "winter": "12",
        "lunch": "13",
        "brunch_brunch": "13",
        "dinner": "13",
        "movie_movie": "13",
        "college_college": "14",
        "simple_wedding": "19",
        "heavy_wedding": "20",
        "cocktail_events_office_circle": "23",
        "theme_party_house": "24",
        "anniversary_dinner_partner": "26"
    },
    "women_tops": {
        "special_wear": "1",
        "office_wear": "2",
        "casual_wear": "3",
        "party_wear": "4",
        "date": "5",
        "birthday": "6",
        "festival": "7",
        "others": "8",
        "formal": "9",
        "semi_formal": "10",
        "casual": "11",
        "lunch_type": "12",
        "daily_wear_type": "13",
        "beach": "14",
        "holidays": "15",
        "other_events_casual": "16",
        "casual_general": "17",
        "college_party": "18",
        "cocktail": "19",
        "party_general": "20",
        "clubbing": "21",
        "house_party": "22",
        "other_events_party": "23",
        "indoor": "24",
        "outdoor": "25",
        "going_yes": "26",
        "going_no": "27",
        "simple": "28",
        "heavy": "29",
        "hot": "30",
        "cold": "31",
        "day": "32",
        "night": "33",
        "powerful_formal_color": "36",
        "feminine_formal_color": "37",
        "bright_formal_color": "38",
        "color_formal_none": "39",
        "powerful_color": "40",
        "feminine_color": "41",
        "bright_color": "42",
        "relax_color": "43",
        "colorful": "44",
        "color_casual_none": "45",
        "bold": "46",
        "modest": "47",
        "intermediate": "48",
        "bold_none": "49",
        "family": "34",
        "friends": "35",
        "special_occasion": "1",
        "date_night_date_night": "5",
        "anniversary_dinner_partner": "6",
        "concerts_concerts": "8",
        "casual_office": "11",
        "lunch": "12",
        "brunch_brunch": "12",
        "dinner": "12",
        "movie_movie": "12",
        "college_college": "13",
        "pool_party_pool_party": "14",
        "vacation": "15",
        "cocktail_events_office_circle": "19",
        "theme_party_house": "22",
        "simple_wedding": "28",
        "heavy_wedding": "29",
        "summer": "30",
        "winter": "31"
    },
    "women_tshirts": {
        "casual_wear": "1",
        "sports_wear": "2",
        "office_wear": "3",
        "party_wear": "4",
        "lunch_type": "5",
        "daily_wear_type": "6",
        "holidays": "7",
        "casual_general": "8",
        "other_events_casual": "9",
        "indoor_sports": "10",
        "outdoor_sports": "11",
        "indoor": "12",
        "outdoor": "13",
        "hot": "14",
        "cold": "15",
        "day": "16",
        "night": "17",
        "bold": "23",
        "modest": "24",
        "intermediate": "25",
        "bold_none": "26",
        "powerful_color": "27",
        "feminine_color": "28",
        "bright_color": "29",
        "relax_color": "30",
        "colorful": "31",
        "color_casual_none": "32",
        "clubbing": "18",
        "college_party": "19",
        "birthday": "20",
        "party_general": "21",
        "other_events_party": "22",
        "workout": "2",
        "lunch": "5",
        "brunch_brunch": "5",
        "dinner": "5",
        "movie_movie": "5",
        "college_college": "6",
        "vacation": "7",
        "gym": "10",
        "yoga_class_yoga_class": "10",
        "dance_class_aerobics": "10",
        "trekking_trekking": "11",
        "mountain_climbing": "11",
        "swimming": "11",
        "cycling": "11",
        "summer": "14",
        "winter": "15",
        "theme_party_house": "18",
        "anniversary_dinner_partner": "20"
    },
    "women_kurta": {
        "special_wear": "1",
        "office_wear": "2",
        "casual_wear": "3",
        "date": "4",
        "birthday": "5",
        "festival": "6",
        "cocktail": "7",
        "wedding": "8",
        "others": "9",
        "lunch_type": "10",
        "daily_wear_type": "11",
        "holidays": "12",
        "casual_general": "13",
        "other_events_casual": "14",
        "formal": "15",
        "semi_formal": "16",
        "casual": "17",
        "indoor": "18",
        "outdoor": "19",
        "simple": "20",
        "heavy": "21",
        "hot": "22",
        "cold": "23",
        "day": "24",
        "night": "25",
        "powerful_formal_color": "26",
        "feminine_formal_color": "27",
        "bright_formal_color": "28",
        "color_formal_none": "29",
        "powerful_color": "30",
        "feminine_color": "31",
        "bright_color": "32",
        "relax_color": "33",
        "colorful": "34",
        "color_casual_none": "35",
        "bold": "36",
        "modest": "37",
        "intermediate": "38",
        "bold_none": "39",
        "special_occasion": "1",
        "date_night_date_night": "4",
        "anniversary_dinner_partner": "5",
        "cocktail_events_office_circle": "7",
        "concerts_concerts": "9",
        "lunch": "10",
        "brunch_brunch": "10",
        "dinner": "10",
        "movie_movie": "10",
        "college_college": "11",
        "vacation": "12",
        "casual_office": "17",
        "simple_wedding": "20",
        "heavy_wedding": "21",
        "summer": "22",
        "winter": "23"
    },
    "women_jeans": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "semi_formal": "4",
        "casual": "5",
        "birthday": "6",
        "cocktail": "7",
        "clubbing": "8",
        "party_general": "9",
        "other_events_party": "10",
        "blacks_color": "11",
        "blues_color": "12",
        "light_colors": "13",
        "color_casual_none": "14",
        "colorful": "15",
        "bold": "16",
        "modest": "17",
        "intermediate": "18",
        "bold_none": "19",
        "casual_office": "5",
        "anniversary_dinner_partner": "6",
        "date_night_date_night": "6",
        "cocktail_events_office_circle": "7",
        "theme_party_house": "8"
    },
    "women_jackets": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "workout_wear": "4",
        "travel": "5",
        "semi_formal": "6",
        "casual": "7",
        "lunch_type": "8",
        "daily_wear_type": "9",
        "casual_general": "10",
        "other_events_casual": "11",
        "cocktail": "12",
        "birthday": "13",
        "clubbing": "14",
        "party_general": "15",
        "other_events_party": "16",
        "not_cold": "17",
        "mild_cold": "18",
        "moderate_cold": "19",
        "extreme_cold": "20",
        "windy": "21",
        "rainy": "22",
        "windy_nor_rainy": "23",
        "trip_no": "24",
        "trip_yes": "25",
        "powerful_color": "26",
        "feminine_color": "27",
        "bright_color": "28",
        "relax_color": "29",
        "colorful": "30",
        "color_casual_none": "31",
        "workout": "4",
        "vacation": "5",
        "casual_office": "7",
        "lunch": "8",
        "brunch_brunch": "8",
        "dinner": "8",
        "movie_movie": "8",
        "college_college": "9",
        "cocktail_events_office_circle": "12",
        "anniversary_dinner_partner": "13",
        "date_night_date_night": "13",
        "theme_party_house": "14",
        "snow_vacation": "20",
        "monsoon": "22"
    },
    "women_handbags": {
        "casual": "19",
        "party_wear": "2",
        "work": "3",
        "lunch_type": "4",
        "daily_wear_type": "5",
        "holidays": "6",
        "beach": "7",
        "other_events_casual": "8",
        "casual_general": "9",
        "cocktail": "10",
        "clubbing": "11",
        "college_party": "12",
        "party_general": "13",
        "birthday": "14",
        "date": "15",
        "festival": "16",
        "other_events_party": "17",
        "formal": "18",
        "roomy": "20",
        "essential": "21",
        "non_functional": "22",
        "functional_good": "23",
        "handbag_none": "24",
        "colorful": "25",
        "bright_color": "26",
        "elegant_color": "27",
        "subtle_color": "28",
        "color_casual_none": "29",
        "casual_wear": "1",
        "special_occasion": "2",
        "office_wear": "3",
        "lunch": "4",
        "brunch_brunch": "4",
        "dinner": "4",
        "movie_movie": "4",
        "college_college": "5",
        "vacation": "6",
        "cocktail_events_office_circle": "10",
        "theme_party_house": "11",
        "anniversary_dinner_partner": "14",
        "date_night_date_night": "15",
        "wedding": "16",
        "casual_office": "19"
    },
    "women_flats": {
        "casual": "20",
        "party_wear": "2",
        "work": "3",
        "special_wear": "4",
        "lunch_type": "5",
        "daily_wear_type": "6",
        "beach": "7",
        "casual_general": "8",
        "other_events_casual": "9",
        "cocktail": "10",
        "clubbing": "11",
        "college_party": "12",
        "party_general": "13",
        "birthday": "14",
        "other_events_party": "15",
        "date": "16",
        "festival": "17",
        "others": "18",
        "formal": "19",
        "dressy_foot": "21",
        "cute_foot": "22",
        "simple_foot": "23",
        "flats_none": "24",
        "colorful": "25",
        "bright_color": "26",
        "elegant_color": "27",
        "subtle_color": "28",
        "color_casual_none": "29",
        "casual_wear": "1",
        "office_wear": "3",
        "special_occasion": "4",
        "lunch": "5",
        "brunch_brunch": "5",
        "dinner": "5",
        "movie_movie": "5",
        "vacation": "5",
        "college_college": "6",
        "cocktail_events_office_circle": "10",
        "theme_party_house": "11",
        "anniversary_dinner_partner": "14",
        "date_night_date_night": "16",
        "wedding": "17",
        "concerts_concerts": "18",
        "casual_office": "20"
    },
    "women_heels": {
        "casual": "20",
        "party_wear": "2",
        "work": "3",
        "special_wear": "4",
        "lunch_type": "5",
        "daily_wear_type": "6",
        "beach": "7",
        "casual_general": "8",
        "other_events_casual": "9",
        "cocktail": "10",
        "clubbing": "11",
        "college_party": "12",
        "party_general": "13",
        "birthday": "14",
        "other_events_party": "15",
        "date": "16",
        "festival": "17",
        "others": "18",
        "formal": "19",
        "dressy_foot": "21",
        "cute_foot": "22",
        "simple_foot": "23",
        "heels_none": "24",
        "colorful": "25",
        "bright_color": "26",
        "elegant_color": "27",
        "subtle_color": "28",
        "color_casual_none": "29",
        "casual_wear": "1",
        "office_wear": "3",
        "special_occasion": "4",
        "lunch": "5",
        "brunch_brunch": "5",
        "dinner": "5",
        "movie_movie": "5",
        "vacation": "5",
        "college_college": "6",
        "cocktail_events_office_circle": "10",
        "theme_party_house": "11",
        "anniversary_dinner_partner": "14",
        "date_night_date_night": "16",
        "wedding": "17",
        "concerts_concerts": "18",
        "casual_office": "20"
    },
    "women_casual_shoes": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "semi_formal": "4",
        "casual": "5",
        "lunch_type": "6",
        "beach": "7",
        "daily_wear_type": "8",
        "casual_general": "9",
        "other_events_casual": "10",
        "birthday": "11",
        "clubbing": "12",
        "party_general": "13",
        "other_events_party": "14",
        "winter": "15",
        "all_season": "16",
        "colorful": "17",
        "bright_color": "18",
        "elegant_color": "19",
        "subtle_color": "20",
        "color_casual_none": "21",
        "dressy_foot": "22",
        "cute_foot": "23",
        "simple_foot": "24",
        "shoes_none": "25",
        "casual_office": "5",
        "lunch": "6",
        "brunch_brunch": "6",
        "dinner": "6",
        "movie_movie": "6",
        "vacation": "6",
        "college_college": "8",
        "anniversary_dinner_partner": "11",
        "date_night_date_night": "11",
        "theme_party_house": "12"
    },
    "women_shirts": {
        "office_wear": "1",
        "casual_wear": "2",
        "formal": "3",
        "semi_formal": "4",
        "casual": "5",
        "meeting_yes": "6",
        "meeting_no": "7",
        "lunch_type": "8",
        "daily_wear_type": "9",
        "holidays": "10",
        "beach": "11",
        "other_events_casual": "12",
        "casual_general": "13",
        "powerful_formal_color": "14",
        "feminine_formal_color": "15",
        "bright_formal_color": "16",
        "color_formal_none": "17",
        "powerful_color": "18",
        "feminine_color": "19",
        "bright_color": "20",
        "relax_color": "21",
        "colorful": "22",
        "color_casual_none": "23",
        "bold": "24",
        "modest": "25",
        "intermediate": "26",
        "bold_none": "27",
        "casual_office": "5",
        "lunch": "8",
        "brunch_brunch": "8",
        "dinner": "8",
        "movie_movie": "8",
        "college_college": "9",
        "vacation": "10"
    },
    "women_skirts": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "formal": "4",
        "semi_formal": "5",
        "casual": "6",
        "lunch_type": "7",
        "daily_wear_type": "8",
        "beach": "9",
        "holiday": "10",
        "date": "11",
        "casual_general": "12",
        "others_casual": "13",
        "cocktail": "14",
        "clubbing": "15",
        "freshers": "16",
        "birthday": "17",
        "pool_party": "18",
        "event_none": "19",
        "others_party": "20",
        "family": "21",
        "friends": "22",
        "indoor": "23",
        "outdoor": "24",
        "day": "25",
        "night": "26",
        "hot": "27",
        "cold": "28",
        "powerful_formal_color": "29",
        "feminine_formal_color": "30",
        "bright_formal_color": "31",
        "color_formal_none": "32",
        "powerful_color": "33",
        "feminine_color": "34",
        "bright_color": "35",
        "relax_color": "36",
        "colorful": "37",
        "color_casual_none": "38",
        "bold": "39",
        "modest": "40",
        "intermediate": "41",
        "bold_none": "42",
        "casual_office": "6",
        "lunch": "7",
        "brunch_brunch": "7",
        "dinner": "7",
        "movie_movie": "7",
        "college_college": "8",
        "vacation": "10",
        "date_night_date_night": "11",
        "cocktail_events_office_circle": "14",
        "theme_party_house": "15",
        "college_party": "16",
        "anniversary_dinner_partner": "17",
        "pool_party_pool_party": "18"
    },
    "women_trousers": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "formal": "4",
        "semi_formal": "5",
        "casual": "6",
        "beach": "7",
        "lunch_type": "8",
        "daily_wear_type": "9",
        "holiday": "10",
        "casual_general": "11",
        "others_casual": "12",
        "office": "13",
        "college": "14",
        "birthday": "15",
        "event_none": "16",
        "others_party": "17",
        "indoor": "18",
        "outdoor": "19",
        "day": "20",
        "night": "21",
        "hot": "22",
        "cold": "23",
        "powerful_formal_color": "24",
        "feminine_formal_color": "25",
        "bright_formal_color": "26",
        "color_formal_none": "27",
        "powerful_color": "28",
        "feminine_color": "29",
        "bright_color": "30",
        "relax_color": "31",
        "colorful": "32",
        "color_casual_none": "33",
        "casual_office": "6",
        "lunch": "8",
        "brunch_brunch": "8",
        "dinner": "8",
        "movie_movie": "8",
        "college_college": "9",
        "vacation": "10",
        "cocktail_events_office_circle": "13",
        "college_party": "14",
        "anniversary_dinner_partner": "15",
        "summer": "22",
        "winter": "23"
    },
    "women_shorts": {
        "casual_wear": "1",
        "party_wear": "2",
        "sports_wear": "3",
        "beach": "4",
        "lunch_type": "5",
        "daily_wear_type": "6",
        "holiday": "7",
        "casual_general": "8",
        "others_casual": "9",
        "pool_party": "10",
        "clubbing": "11",
        "freshers": "12",
        "event_none": "13",
        "others_party": "14",
        "indoor": "15",
        "outdoor": "16",
        "day": "17",
        "night": "18",
        "powerful_color": "19",
        "feminine_color": "20",
        "bright_color": "21",
        "relax_color": "22",
        "colorful": "23",
        "color_casual_none": "24",
        "bold": "25",
        "intermediate": "26",
        "bold_none": "27",
        "workout": "3",
        "lunch": "5",
        "brunch_brunch": "5",
        "dinner": "5",
        "movie_movie": "5",
        "college_college": "6",
        "vacation": "7",
        "pool_party_pool_party": "10",
        "theme_party_house": "11",
        "college_party": "12"
    },
    "women_sweatshirts": {
        "active": "1",
        "daily_wear_type": "2",
        "college_wear": "3",
        "lunch_type": "4",
        "others_casual": "5",
        "powerful_color": "6",
        "feminine_color": "7",
        "bright_color": "8",
        "relax_color": "9",
        "colorful": "10",
        "color_casual_none": "11",
        "bold": "12",
        "modest": "13",
        "bold_none": "14",
        "workout": "1",
        "college_college": "3",
        "lunch": "4",
        "brunch_brunch": "4",
        "movie_movie": "4",
        "concerts_concerts": "5"
    },
    "women sweaters": {
        "office_wear": "1",
        "daily_wear": "2",
        "college_wear": "3",
        "others": "4",
        "holiday": "5",
        "special_occasion": "6",
        "powerful_color": "7",
        "feminine_color": "8",
        "bright_color": "9",
        "relax_color": "10",
        "colorful": "11",
        "color_casual_none": "12",
        "Casual Wear": "2",
        "college_college": "3",
        "concerts_concerts": "4",
        "vacation": "5"
    },
    "women_capris": {
        "casual_wear": "1",
        "beach": "2",
        "lunch_type": "3",
        "daily_wear_type": "4",
        "holiday": "5",
        "casual_general": "6",
        "others_casual": "7",
        "day": "8",
        "night": "9",
        "powerful_color": "10",
        "feminine_color": "11",
        "bright_color": "12",
        "relax_color": "13",
        "colorful": "14",
        "color_casual_none": "15",
        "bold": "16",
        "intermediate": "17",
        "bold_none": "18",
        "pool_party_pool_party": "2",
        "lunch": "3",
        "brunch_brunch": "3",
        "dinner": "3",
        "movie_movie": "3",
        "college_college": "4",
        "vacation": "5"
    },
    "women_jeggings": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "lunch_type": "4",
        "daily_wear_type": "5",
        "holidays": "6",
        "other_events_casual": "7",
        "casual_general": "8",
        "clubbing": "9",
        "freshers": "10",
        "birthday": "11",
        "event_none": "12",
        "others_party": "13",
        "powerful_color": "14",
        "feminine_color": "15",
        "bright_color": "16",
        "relax_color": "17",
        "colorful": "18",
        "color_casual_none": "19",
        "lunch": "4",
        "brunch_brunch": "4",
        "dinner": "4",
        "movie_movie": "4",
        "college_college": "5",
        "vacation": "6",
        "theme_party_house": "9",
        "college_party": "10",
        "anniversary_dinner_partner": "11"
    },
    "women_jumpsuits": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "lunch_type": "4",
        "beach": "5",
        "daily_wear_type": "6",
        "holiday": "7",
        "date": "8",
        "casual_general": "9",
        "others_casual": "10",
        "season_yes": "11",
        "season_no": "12",
        "clubbing": "13",
        "freshers": "14",
        "birthday": "15",
        "event_none": "16",
        "others_party": "17",
        "indoor": "18",
        "outdoor": "19",
        "day": "20",
        "night": "21",
        "powerful_color": "22",
        "feminine_color": "23",
        "bright_color": "24",
        "relax_color": "25",
        "colorful": "26",
        "color_casual_none": "27",
        "lunch": "4",
        "brunch_brunch": "4",
        "dinner": "4",
        "movie_movie": "4",
        "college_college": "6",
        "vacation": "7",
        "date_night_date_night": "8",
        "theme_party_house": "13",
        "college_party": "14",
        "anniversary_dinner_partner": "15"
    },
    "women_blazers": {
        "office_wear": "1",
        "casual_wear": "2",
        "party_wear": "3",
        "semi_formal": "4",
        "casual": "5",
        "cocktail": "6",
        "birthday": "7",
        "clubbing": "8",
        "party_general": "9",
        "other_events_party": "10",
        "hot": "11",
        "cold": "12",
        "powerful_color": "13",
        "feminine_color": "14",
        "bright_color": "15",
        "relax_color": "16",
        "colorful": "17",
        "color_casual_none": "18",
        "casual_office": "5",
        "cocktail_events_office_circle": "6",
        "anniversary_dinner_partner": "7",
        "date_night_date_night": "7",
        "theme_party_house": "8",
        "summer": "11",
        "winter": "12"
    }
    };
module.exports = {
    fetching_products:fetching_products,
    get_number:get_number,
    get_products: get_products,
    get_adjectives : get_adjectives,
    get_tags : get_tags,
    profile_benefits : profile_benefits,
    pick_broad_occasion : pick_broad_occasion,
    benefit_name : benefit_name
};

//# sourceMappingURL=functions-compiled.js.map
