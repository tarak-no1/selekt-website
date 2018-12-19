var mapValues = {
    "os": "os_name",
    "camera_resolution": "primary_camera_resolution",
    "bluetooth": "bluetooth_type",
    "touch screen": "touch_screen",
    "removable battery": "removable_battery",
    "brand": "brand",
    "music player": "music_player",
    "ram": "ram_memory",
    "number flipkart ratings": "no_of_ratings_flipkart",
    "fm": "FM",
    "weight": "weight",
    "gps": "gps_type",
    "cores": "no_of_cores",
    "sim type": "sim_type",
    "sim size": "sim_size",
    "video player": "video_player",
    "flash": "flash_type",
    "display type": "display_type",
    "front_camera_resolution": "front_camera_resolution",
    "model name": "model_name",
    "battery type": "battery_type",
    "battery score": "battery_score",
    "announced date": "announced_date",
    "wifi": "wifi_type",
    "expandable memory": "expandable_memory",
    "screen size": "screen_size",
    "primary flash": "flash_type",
    "processor": "processor_type",
    "audio jack": "audio_jack",
    "average rating in amazon": "average_rating_amazon",
    "average rating flipkart": "average_rating_flipkart",
    "handset color": "available_colors",
    "mobile color": "available_colors",
    "USB type": "usb_type",
    "primary camera resolution": "primary_camera_resolution",
    "battery_capacity": "battery_capacity",
    "sensors": "sensors",
    "video": "hd_recording",
    "rating": "average_rating",
    "primary camera features": "primary_camera_features",
    "height": "phone_height",
    "in the box": "in_the_box",
    "display resolution": "display_resolution",
    "thickness": "thickness",
    "width": "phone_width",
    "number amazon ratings": "no_of_ratings_amazon",
    "secondary camera features": "front_camera_resolution",
    "processor frequency": "processor_frequency",
    "internal memory": "internal_memory",
    "pros": "pros",
    "cons": "cons",
    "gpu rank": "gpu_rank",
    "pixel density": "screen_pixel_density",
    "micro sd slot": "micro_sd_slot",
    "talk time": "talk_time",
    "stand by time": "stand_by_time",
    "aperture": "aperture",
    "flipkart rating": "average_rating_flipkart",
    "amazon rating": "average_rating_amazon",
    "gpu": "gpu",
    "audio format": "audio_formats",
    "screen protection": "screen_protection",
    "water proof": "water_proof_rate",
    "price": "price",
    "popular": "Popular",
    "verdict": "verdict_review",
    "display review": "display_review",
    "battery review": "battery_review",
    "camera review": "camera_review",
    'camera': "primary_camera_resolution",
    'battery': "battery_capacity",
    'display': "display_type"

};

function isDbKeyExists(key) {
    "use strict";

    return key in mapValues;
}

function getDbKey(key) {
    "use strict";

    return mapValues[key];
}

var mapSKUKeys = {
    'model_name': "MODEL NAME",
    'price': "PRICE",
    'os': "OS",
    'sim_type': "SIM TYPE",
    'display_type': "DISPLAY TYPE",
    'sim_size': "SIM SIZE",
    'network_support': "NETWORK SUPPORT",
    'primary_camera_resolution': "CAMERA RESOLUTION",
    'front_camera_resolution': "FRONT CAMERA RESOLUTION",
    'ram_memory': "RAM MEMORY",
    'internal_memory': "INTERNAL MEMORY",
    'removable_battery': "REMOVABLE BATTERY",
    'flash_type': "FLASH TYPE", 'primary_camera_features': "PRIMARY CAMERA FEATURES", 'auto_focus': "AUTO FOCUS",
    'aperture': "APERTURE",
    'battery_capacity': "BATTERY CAPACITY",
    'battery_type': "BATTERY TYPE", 'stand_by_time': "STAND BY TIME", 'talk_time': "TALK TIME",
    'processor_type': "PROCESSOR TYPE", 'processor_frequency': "PROCESSOR FREQUENCY", 'no_of_cores': "No Of Cores", 'gpu': "GPU",
    'Network_support': "NETWORK SUPPORT", 'gps_type': "GPS TYPE", 'wifi_type': "WIFI TYPE",
    'micro_sd_slot': "MICRO SD SLOT", 'expandable_memory': "EXPANDABLE MEMORY",
    'weight': "WEIGHT", 'phone_height': "PHONE HEIGHT", 'phone_width': "PHONE WIDTH", 'thickness': "THICKNESS",
    'average_rating_flipkart': "FLIPKART RATING", 'no_of_ratings_flipkart': "NO OF RATINGS FLIPKART",
    'average_rating_amazon': "AMAZON RATING", 'no_of_ratings_amazon': "NO OF RATINGS AMAZONG", 'average_rating': "AVERAGE RATING",
    'screen_size': "SCREEN SIZE",
    'processor_rank': "PROCESSOR RANK",
    'display_resolution': "DISPLAY RESOLUTION",
    'brand': "BRAND", 'display_type ': 'DISPLAY TYPE',
    'screen_protection': 'SCREEN PROTECTION',
    'screen_pixel_density': 'SCREEN PIXEL DENSITY',
    '': ""
};

function doesSKUKeyExists(key) {
    "use strict";

    return key in mapSKUKeys;
}
function getSKUKey(key) {
    "use strict";

    return mapSKUKeys[key];
}

//sort orders for displaying mobiles
var specSortMappings = {
    // Features
    'camera': { "camera_score": "desc", "primary_camera_resolution": "desc", "price": "asc" },
    'battery': { "talk_time": "desc", "battery_score": "desc", "battery_capacity": "desc", "price": "asc" },
    'performance': { "performance_score": "desc", "processor_rank": "asc", "price": "asc" },
    'display': { "display_score": "desc", "price": "asc" },
    'phonelist_camera': { "camera_score": "desc", "primary_camera_resolution": "desc", "price": "asc" },
    'memory': { "_script": {
            "type": "number",
            "script": "doc['internal_memory'].value + doc['expandable_memory'].value",
            "order": "desc"
        }
    },
    'audio': { 'overall_score': 'desc' },
    'video': { 'overall_score': 'desc' },
    'network': { 'overall_score': 'desc' },
    'phonelist_battery': { 'talk_time': 'desc' },
    'brand': { 'brand_rank': 'asc', 'overall_score': 'desc' },
    'capacity': { "battery_capacity": 'desc', 'battery_score': 'desc', "price": "asc" },
    "rating": { 'average_rating': 'desc', 'performance_score': 'desc', "price": "asc" },
    "gpu": { "gpu_rank": 'asc', 'performance_score': 'desc', "price": "asc" },
    "camera_resolution": { 'primary_camera_resolution': 'desc', "camera_score": 'desc', "price": "asc" },
    "front_camera_resolution": { "front_camera_resolution": 'desc', 'camera_score': 'desc', "price": "asc" },
    "phonelist_front_camera": { "front_camera_resolution": 'desc', 'camera_score': 'desc', "price": "asc" },
    "internal memory": { 'internal_memory': 'desc', "price": "asc" },
    "ram": { 'ram_memory': 'desc', "price": "asc" },
    "processor": { "processor_rank": 'asc', 'performance_score': 'desc', "price": "asc" },
    "phonelist_perform": { "processor_rank": 'asc', 'performance_score': 'desc', "price": "asc" },
    "thickness": { 'thickness': 'asc', 'overall_score': 'desc', "price": 'asc' },
    "height": { 'phone_width': 'asc', "price": 'asc' },
    "weight": { 'weight': 'asc', 'thickness': 'asc', "price": 'asc' },
    "number fipkart ratings": { 'no_of_ratings_flipkart': 'desc', 'overall_score': 'desc', 'price': 'asc' },
    "average rating amazon": { 'no_of_ratings_amazon': 'desc', 'overall_score': 'desc', 'price': 'asc' },
    "screen protection": { "overall_score": "desc", 'price': "asc" },
    "phonelist_memory": { "_script": {
            "type": "number",
            "script": "doc['internal_memory'].value + doc['expandable_memory'].value",
            "order": "desc"
        }
    },
    phonelist_autofocus: { camera_score: "desc" },
    phonelist_videos: { camera_score: "desc" },
    "popular": { "overall_score": "desc" },
    "overall": { "overall_score": "desc" },
    "price": { "price": "asc" },
    "processor_type": { 'processor_rank': "asc" },
    "adult female": { "front_camera_resolution": "desc", 'thickness': 'asc', "primary_camera_resolution": "desc" },
    "adult male": { 'performance_score': 'desc', 'battery_score': 'desc' },
    'kids': { "overall_score": "desc" },
    "os": { "overall_score": "desc", "version": "desc", 'price': "asc" },
    'selfie': { "front_camera_resolution": "desc", 'overall_score': 'asc' },
    "slim": { 'thickness': 'asc', 'overall_score': 'asc' },
    'daytime': {}
};

function isSpecSortKeyExists(key) {
    "use strict";

    return key in specSortMappings;
}
function specsSortValue(key) {
    "use strict";

    return specSortMappings[key];
}

//fields
var attributeFieldMappings = {

    phone: ['price', 'brand', 'os', 'screen_size', 'processor_type', 'ram_memory', 'internal_memory', 'battery_capacity', 'primary_camera_resolution'],
    camera: ['primary_camera_resolution', 'flash_type', 'front_camera_resolution', 'auto_focus', 'aperture'],
    battery: ['battery_capacity', 'battery_type', 'stand_by_time', 'talk_time'],
    performance: ['processor_type', 'processor_frequency', 'no_of_cores', 'gpu', 'ram_memory'],
    connectivity: ['Network_support', 'gps_type', 'wifi_type'],
    network: ['Network_support', 'gps_type', 'wifi_type'],
    storage: ['internal_memory', 'micro_sd_slot', 'expandable_memory'],
    dimensions: ['weight', 'phone_height', 'phone_width', 'thickness'],
    rating: ['average_rating_flipkart', 'no_of_ratings_flipkart', 'average_rating_amazon', 'no_of_ratings_amazon', 'average_rating'],
    video: ['video_resolution', 'hd_recording', 'frames_per_second', 'video_formats'],
    audio: ['music_player', 'loudspeaker', 'audio_jack', 'audio_formats', 'FM'],
    display: ['display_resolution', 'display_type', 'screen_protection', 'screen_pixel_density', 'screen_size'],
    general: ['brand', 'model_name', 'os', 'price', 'announced_date', 'available_colors', 'in_the_box'],
    pros: ['pros'],
    cons: ['cons'],
    os: ["os_name"],
    howz: ['pros', 'cons'],
    better: ['overall_score', 'internal_memory', 'ram_memory', 'battery_capacity', 'primary_camera_resolution', 'price'],
    sku: ['price', 'os', 'screen_size', 'primary_camera_resolution', 'front_camera_resolution', 'display_resolution', 'processor_type', 'no_of_cores', 'ram_memory', 'internal_memory', 'battery_capacity', 'removable_battery'],
    skuandroid: ['_id', 'model_name', 'price', 'os', 'screen_size', 'front_camera_resolution', 'display_score', 'brand', 'announced_date', 'os', 'version_name', 'version', 'gpu_type', 'gpu_rank', 'auto_focus', 'no_of_cores', 'ram_memory', 'verdict_review', 'primary_camera_resolution', 'battery_score', 'overall_score', 'removable_battery', 'battery_capacity', 'battery_type', 'internal_memory', 'micro_sd_slot', "video_resolution", 'pros', 'cons', 'average_rating_flipkart', 'average_rating_amazon', 'no_of_ratings_flipkart', 'no_of_ratings_amazon', 'phone_height', 'phone_width', 'thickness', 'weight', 'flash_type', 'primary_camera_features', 'display_type', 'display_resolution', 'screen_pixel_density', 'FM', 'screen_protection', 'processor_type', 'processor_frequency', 'non_removable_battery', 'gpu', 'expandable_memory', 'video_formats', 'audio_formats', 'hd_recording', 'loudspeaker', 'audio_jack', 'performance_score', 'stand_by_time', 'talk_time', 'wifi_type', 'gps_type', 'network_support', 'usb_type', 'pic_urls', 'sim_type', 'sim_size', 'pics_urls', 'average_rating', 'in_the_box', 'available_colors', 'sensors', 'purchase_url', 'overall_score', 'camera_score']
};

function getFieldsAttribute(key) {
    "use strict";

    key = key.toLowerCase();
    var field_keys = attributeFieldMappings[key];
    if (field_keys == null) field_keys = getDbKey(key);
    return field_keys;
}

var relevantAttributes = {
    camera: [{ "primary_camera_resolution": "CAMERA RESOLUTION" }, { "front_camera_resolution": " FRONT CAMERA RESOLUTION" }, { "video_resolution": " VIDEO RESOLUTION" }, { "internal_memory": " INTERNAL MEMORY" }],
    performance: [{ gpu: "GPU" }, { ram_memory: " RAM MEMORY" }, { processor_type: "PROCESSOR TYPE" }, { battery_capacity: "BATTERY CAPACITY" }, { processor_frequency: "PROCESSOR FREQUENCY" }],
    battery: [{ battery_capacity: "BATTERY CAPACITY" }, { battery_type: "BATTERY TYPE" }, { non_removable_battery: " NON REMOVABLE BATTERY" }, { stand_by_time: "STANDBY TIME" }],
    display: [{ screen_size: "SCREEN SIZE" }, { display_resolution: "DISPLAY RESOLUTION" }, { display_type: " DISPLAY TYPE" }, { screen_pixel_density: "PPI" }, { battery_capacity: "BATTERY" }, { video_resolution: "VIDEO RESOLUTION" }],
    "front camera resolution": [{ front_camera_resolution: "FRONT CAMERA RESOLUTION" }, { primary_camera_resolution: "PRIMARY CAMERA RESOLUTION" }, { video_resolution: " VIDEO RESOLUTION" }, { auto_focus: "AUTO FOCUS" }, { flash_type: "FLASH TYPE" }, { internal_memory: "INTERNAL MEMORY" }],
    memory: [{ micro_sd_slot: "MICRO SD SLOT" }, { "internal_memory": "INTERNAL MEMORY" }, { "expandable_memory": "EXPANDABLE MEMORY" }, { "ram_memory": "RAM MEMORY" }],

    all: [{ battery_capacity: "BATTERY CAPACITY" }, { screen_size: "SCREEN SIZE" }, { ram_memory: " RAM MEMORY" }, { "primary_camera_resolution": "CAMERA RESOLUTION" }, { "internal_memory": " INTERNAL MEMORY" }],
    phonelist_videos: [{ video_resolution: " VIDEO RESOLUTION" }, { screen_size: "SCREEN SIZE" }, { display_resolution: "DISPLAY RESOLUTION" }],
    phonelist_autofocus: [{ auto_focus: " AUTO FOCUS " }]

};

function hasReleventAttriubte(key) {
    return relevantAttributes[key];
}
function getRelevantAttribute(key) {
    return relevantAttributes[key];
}

var queries = {
    "water proof": { bool: { "must_not": [{ "match": { "water_proof_rate": "no" } }] } },
    "screen protection": { bool: { "must_not": [{ "match": { "screen_protection": "no" } }] } },
    "removable battery": { bool: { "must": [{ "match": { "removable_battery": "Yes" } }] } },
    "non removable battery": { bool: { "must": [{ "match": { "removable_battery": "No" } }] } },
    "auto focus": { bool: { "must": [{ "match": { "auto_focus": "yes" } }] } },
    "micro sd slot": { bool: { "must": [{ "match": { "micro_sd_slot": "yes" } }] } }
};

function isQueryExists(key) {
    return key in queries;
}
function queryValue(key) {
    "use strict";

    return queries[key];
}

var specsScores = {
    camera: "camera_score",
    battery: "battery_score",
    display: "display_score",
    performance: "performance_score",
    capacity: "battery_capacity",
    overall: "overall_score",
    rating: "average_rating",
    "camera_resolution": "primary_camera_resolution",
    "front_camera_resolution": "front_camera_resolution",
    "pixel density": "screen_pixel_density",
    "internal memory": "internal_memory",
    "expandable memory": "expandable_memory",
    "thickness": "thickness",
    "screen size": "screen_size",
    "weight": "weight",
    "os": "os_rank",
    "video resolution": "video_resolution",
    "average rating": "average_rating"
};

function getSpecScores(key) {
    "use strict";

    return specsScores[key];
}
function hasSpecScores(key) {
    "use strict";

    return key in specsScores;
}

var mapRankings = {
    'brand': 'brand_rank',
    'gpu': 'gpu_rank',
    'processor': 'processor_rank',
    'os': 'os_rank'

};

function isHaveRank(attribute) {
    "use strict";

    return attribute in mapRankings;
}

function getRank(attribute) {
    "use strict";

    return mapRankings[attribute];
}

// get Time
function getPastTime(past_time) {
    "use strict";

    var date = new Date();
    var today = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    var obj = {};
    obj.end_time = today;
    var lastMonth = date.getDate() + "." + (date.getMonth() - 1) + "." + date.getFullYear();
    var thisWeek = date.getDate() - 7 + "." + date.getMonth() + "." + date.getFullYear();
    var yesterday = date.getDate() - 1 + "." + date.getMonth() + "." + date.getFullYear();
    var latest = date.getDate() + "." + (date.getMonth() - 3) + "." + date.getFullYear();

    if (past_time === "previous month") obj.start_time = lastMonth;else if (past_time === "this week") obj.start_time = thisWeek;else if (past_time === "yesterday") obj.start_time = yesterday;else if (past_time === "latest") obj.start_time = latest;

    return obj;
}
var listReasonMessages = {
    'processor': "List is sorted based on the popular AnTuTu and Notebookcheck benchmark scores for processors.",
    'memory': "List is sorted based on the the sum of internal memory and expandable memory of the phones.",
    'gpu': "List is sorted based on the popular AnTuTu and Notebookcheck benchmark scores for GPUs.",
    'rating': "Best rated phones are ranked in such a way that the phones with highest average rating from Flipkart and amazon in the given price is ranked first.",
    'phone': 'List is sorted based  on specifications, user reviews and critic reviews.',
    'camera': 'List is sorted based on camera specifications and expert camera reviews.',
    'performance': 'List is sorted based on processor type, RAM size and expert performance reviews.',
    'battery': 'List is sorted based on battery capacity, stand by time, talktime and battery life reviews by users.',
    'display': 'List is sorted based on display resolution, display_type, ppi and expert reviews on display.',
    'popular': 'List is sorted based on Popularity index, specifications, user and critic reviews.',
    'overall': 'List is sorted based  on specifications, user reviews and critic reviews',
    'slim': 'List is sorted based on minimum thickness in your selected price range',
    'phonelist_autofocus': 'List is sorted based on best autofocus system in your selected price range',
    'phonelist_videos': 'List is sorted based on video resolution and also expert camera reviews in your selected price range'
};

function isReasonExists(key) {
    return key in listReasonMessages;
}

function getReasonMessage(key) {
    return listReasonMessages[key];
}

var mapKnowledge = {
    'processor': "Processors also known as CPU act very much like our brains do. They allow data to be processed and moved so that the device can perform tasks, such as loading up an application or running a game. Everything the phone does is computed by the CPU",
    'gpu': "A Graphics Processing Unit (GPU) is a single chip processor primarily used to manage and boost the performance of video & graphics. GPU features include 2D or 3D graphics, rendering polygons, MPEG decoding etc. These features are designed to lessen the work of the CPU (graphics) and produce faster video and graphics",
    'ram': "RAM is Random Access Memory. When your processor computes data, it is faster to retrieve data required for processing from your RAM rather than to load it from your permanent storage which takes time. Devices with more RAM can run more complex software and multiple applications at the same time",
    'camera_resolution': "Resolution refers to the number of pixels in an image. It is sometimes identified by the width and height of the image as well as the total number of pixels in the image. For example, an image that is 2048 pixels wide and 1536 pixels high (2048X1536) contains (multiply) 3,145,728 pixels (or 3.1 Megapixels)",
    'battery capacity': "Battery capacity is product of current and time. For eg: 2100mAh capacity of battery means it is a product of current and time. The mA means milli amperes and h means hours. Any smartphone usually consumes around 210mA each hr. So this battery consumes 2100mA for 10hrs",
    'expandable memory': "This is the external storage capacity of your phone. It depends on the compatibility of the memory card slot and to what extent is it supported. It is the storage which can be removed easily (your memory card) and can be used for storing pictures etc. You may or may not be able to install applications on it",
    'internal memory': "Internal Memory is your phones built in memory which cannot be taken out of the phone. These files as mentioned take up space on your smartphone, so you may have a 16GB internal memory, but you could actually only have 15GB free  to use as 1GB is used for the in built files that make phone work",
    'processor frequency': "The clock rate typically refers to the frequency at which a chip like a central processing unit (CPU), one core of a multi-core processor, is running and is used as an indicator of the processor's speed. It is measured in clock cycles per second or its equivalent, the SI unit hertz (Hz)",
    'gps': "General Packet Radio Services (GPRS) is a packet based wireless communication service that promises data rates from 56 up to 114 Kbps and continuous connection to the Internet for mobile phone and computer users. GPRS is based on Global System for Mobile (GSM) communication",
    'talk time': "Talktime is the battery life it means that you are supposed to be able to talk on the phone for that many minutes before you need to recharge the battery",
    'stand by time': "Standby time refers to the amount of time a phone can remain powered on while not being used. And I mean not being used in the sense of at all. That means no incoming or outgoing texts, messages, phone calls, emails or any thing else that alters the data on the phone",
    'cores': "Core is an element found in the main processor that reads and executes instructions. Devices began with a single-core processor, but now more powerful devices with dual, quad, hexa and octa cores are available. Multiple cores make your experience snappy: Apps load quickly",
    'micro sd slot': "microSD is one of the smallest memory card formats available; a microSD card is about the size of a fingernail. ",
    'gprs': "GPRS is a technology used for transferring data over a cellphone network.",
    "auto focus": "Auto-focus is a feature of digital cameras that allows them to focus correctly on a subject. It enhances the quality of the photo over fixed-focus cameras and allows for close-ups (or the even closer macro shots).",
    "a gps": "Assisted GPS (A-GPS) is used to speed up start-up times of GPS-based positioning systems. GPS may have problems getting a lock when the signal is weak and in such a case A-GPS would assist in getting a lock.",
    "auto hdr": "HDR stands for High Dynamic Range imaging, and it's an old photography practice recently introduced to cameraphones like the iPhone and some Android devices. The Auto HDR function cuts out the postprocessing time, effort and gives HDR image instantly",
    "panorama": "A panorama is any wide-angle view or representation of a physical space, whether in painting, drawing, photography, film, seismic images or a three-dimensional model",
    "sensors": "Modern mobile phones come with a variety of sensors that automate or easy many of our daily tasks.",
    "auto foucs": "Auto-focus is a feature of digital cameras that allows them to focus correctly on a subject. It enhances the quality of the photo over fixed-focus cameras and allows for close-ups (or the even closer macro shots).",
    "aperture": "Aperture is essentially an opening of a lens's diaphragm through which light passes. It works much like the iris and pupil of an eye, by controlling the amount of light which reaches the retina. A bigger aperture hole lets your smartphone camera sensor gather more light, which it needs to produce quality images.",
    "video resolution": "the number represents the number of horizontal lines the video has from top to bottom. A 480p video is made up of 480 lines stacked one on top of another, with each line being 852 pixels wide – that’s what it means when people say a video’s resolution is 852×480.",
    "hd-r": "High-definition video is video of higher resolution and quality than standard-definition. While there is no standardized meaning for high-definition, generally any video image with considerably more than 480 horizontal lines (North America) or 576 horizontal lines (Europe) is considered high-definition",
    "fps": "This measurement is the video resolution measured in time. 24-30 fps is the normal level for good picture quality. A video with lower framerates appear as “choppy” on screen and fail to capture fast moving objects properly.",
    "bluetooth": "Bluetooth is a wireless protocol for exchanging data over short distances from fixed and mobile devices, creating personal area networks.",
    "wifi": "Wi-Fi is a WLAN (Wireless Local Area Network) technology. It provides short-range wireless high-speed data connections between mobile data devices (such as laptops, PDAs or phones) and nearby Wi-Fi access points (special hardware connected to a wired network).",
    "photo resolution": "A term that refers to the number of pixels on a display or in a camera sensor (specifically in a digital image). A higher resolution means more pixels and more pixels provide the ability to display more visual information (resulting in greater clarity and more detail).",
    "pixel density": "Refers to the concentration of pixels on a particular display, measured in pixels per inch (ppi). Pixel density is calculated by dividing the diagonal pixel resolution of a display by its diagonal size.",
    "usb type": "USB is a standard for a wired connection between two electronic devices, including a mobile phone and a desktop computer. The connection is made by a cable that has a connector at either end.",
    "accelerometer": "An accelerometer is a sensor that measures changes in gravitational acceleration of a device. These are used to measure acceleration, tilt and vibration.",
    "ambient light sensor": "Ambient light sensors can adjust display’s backlight which improves user experience and power savings by optimizing the display's viewability.",
    "barometer": "The barometer is a sensor to check altitude and will give you a faster GPS signal.",
    "compass": "Digital compass is a sensor which provides mobile phones with a simple orientation in relation to the Earth's magnetic field. As a result, your phone always know which way is North so it can auto rotate your digital maps depending on your physical orientation.",
    "proximity sensor": "A proximity sensor is a sensor which detects the presence of nearby objects without any physical contact. Proximity sensors are commonly used in smartphones to detect (and skip) accidental touchscreen taps when held to the ear during a call",
    "magnetic sensor": "The Magnetic sensor in your smartphone is not an actual magnet, it is however capable of sensing the magnetic field of earth (using Halls effect) to determine your direction. With Magnetic compass turned on, your navigation will be more precise.",
    "gyroscope": "Gyroscope sensor can provide orientation information as well, but with greater precision. Android's Photo Sphere camera feature can tell how much a phone has been rotated and in which direction.",
    "fingerprint sensor": "Finger print sensor is used as an extra layer of security as a substitute for a lock screen password.",
    "heart rate": "Heartrate sensor can check the heart rate.It enables users to monitor their physical information",
    "rgb sensor": "RGB Sensor measures the intensity of the light and is applied to the Adapt Display, which optimizes screen to surroundings.",
    "hall sensor": "Hall sensor recognizes whether the cover is open or closed.",
    "gesture": "Gesture sensor recognizes hand movements by detecting infrared rays that are reflected from the user’s palm.",
    "pedometer": "Pedometer sensor used for counting the number of steps that the user has taken.",
    "pressure sensor": "Pressure Sensor is useful for monitoring air pressure changes",
    "humidity": "Humidity Sensor is useful for measuring air temperature and humidity",
    "android sensor hub": "Android Sensor hub helps to integrate data from different sensors and process them for example the phone knows when it's been picked up and will automatically display notifications in a low-power white-on-black text until the screen has been properly activated",
    "stereo headset": "Headphones that play back distinct sounds out of the two speakers, the left speaker and the right speaker normally we use them.",
    "datacable": "A data cable is a cable that provides communication between devices like pc and mobile",
    "simtray": "Simtray is sim card holder which is used to insert sim card into mobile",
    "eject tool": "Eject tool is a pin like tool to eject sim card",
    "sar": "SAR is a measure of the rate at which energy is absorbed by the human body when exposed to a radio frequency (RF) electromagnetic field",
    "charging adapter": "Equipment which is used for charging mobile",
    "a-gps": "Assisted GPS (A-GPS) is used to speed up start-up times of GPS-based positioning systems. GPS may have problems getting a lock when the signal is weak and in such a case A-GPS would assist in getting a lock.",
    "hotspot": "Tethering is when you turn you smartphone into a mobile Wi-Fi hotspotand share your phones 3G/4G data connection. Once you've turned tethering on, any device with a wireless connection can connect to the internet via your smartphone's connection",
    "dlna": "The DLNA standard is used for sharing music, photos and video over an existing home network. For example, by using DLNA you could stream video from your phone to a compatible TV-set using a Wi-Fi network",
    "wifi-direct": "a Wi-Fi standard enabling devices to easily connect with each other without requiring a wireless access point. It is useful for everything from internet browsing to file transfer, and to communicate with one or more devices simultaneously at typical Wi-Fi speeds.",
    "amoled": "AMOLED screens are having HD 720 x 1280 resolution, they have wide viewing angles and can even be made transparent or flexible.They tend to have great contrast, as the light on the screen comes from each individual pixel rather than a backlight",
    "super amoled": "Super AMOLED are having Full HD 1080 x 1920 resolution and are having comparitivelyAMOLED thse screen is thinner, lighter, more touch sensitive and less power-hungry, but without that extra layer it's also far less reflective than a typical AMOLED screen, making it easier to view in bright sunlight.",
    "super lcd": "Suuper LCD lights each pixel individually,unlike an AMOLED display which an LCD has a backlight, so the whole screen is lit to some extent, even supposedly black areas.",
    "ips lcd": "An IPS-LCD is a sort of thin display that offers preferred viewing angles over TFT-LCD",
    "tft lcd": "The Thin film transistor liquid crystal display (TFT LCD) technology is the most common display technology used in mobile phones",
    "oled": "In OLED,the light on the screen comes from each individual pixel rather than a backlight",
    "usb on the go": "USB OTG (USB On The Go) is a standard that enables mobile devices to talk to one another. Traditionally mobile devices could only connect to a Mac/PC by USB, but USB OTG makes it possible for devices to connect directly to each other.",
    "micro usb": "Micro USB will be slightly smaller than Mini-USB, the Micro-USB Type-B port is currently the most popular USB port design for latest smartphones and tablets.",
    "mini usb": "Mini USB is significantly smaller, these ports are found in older portable devices, such as digital cameras, smartphones, and older portable drives. This design is becoming obsolete.",
    "reversible connector": "Type-C USB also allows for bi-directional power, so apart from charging the peripheral device, when applicable, a peripheral device could also charge a host device",
    "usb host": "USB Hosts allows you to connect storage devices, like a flash drive, to the phone and use them.In other contexts it can allow for connection of input devices like keyboards and mice.",
    "dual sim": "Dual SIM means it is possible to use two sim cards in same mobile",
    "standard sim": "A SIM is called Standard SIM if it is around two and a half centimetres long, and one and a half centimetres wide.",
    "micro-sim": "A SIM is called Micro SIM,if it is having 12x15mm dimensions.It is the most commonly used SIM in smartphones.",
    "nano-sim": "A SIM is called Nano SIM,if it is having 8.8x12.3mm dimensions",
    "mini-sim": "A SIM is called Mini SIM,if it is having 15×25mm dimensions",
    "glonass": "GLONASS is precise over GPS.",
    "a-glonass": "AGLONASS brings features such as turn by turn navigation, real time traffic data and more. It uses the cell towers near your location to lock your location quickly with the help from your data connection.",
    "bds": "BDS is useful for Chinese people to locate the places easily.",
    "adreno": "Adreno is a Graphic Processing Unit developed by Qualcomm",
    "mali": "Mali is a Graphic Processing Unit developed by ARM.",
    "power vr": "Power VR is a Graphic Processing Unit developed by Imagination Technologies",
    "snapdragon": "Qualcomm Snapdragon is a popular processor chipset series from Qualcomm. It is known for breathtaking speed, jaw-dropping graphics, ultra-fast connectivity and longer battery life on your mobile device so you can do more of the things you love",
    "mediatek": "Mediatek is a company that produces popular processor chipset series called 'MediaTek' series. Delivering extreme computing performance with unmatched power efficiency, some of the new MediaTek processor is set to revolutionize the smartphone industry.",
    "intel atom": "Intel Atom Processors also deliver more heat when running heavy and CPU intensive tasks or while using for long duration",
    "samsung exonys": "It has some heating issues.Performance wise good.It is built by Samsung.",
    "apple a": "Built by Apple Inc.",
    "octacore": "Octa core processor will have 2 pairs of quad cores(8 cores).It consume high power and suffers from heating issues,but performance may increase for some programs",
    "dualcore": "Dual core processor has combined the processing power two processors by having two cores.",
    "hexacore": "Hexa core processor will have 6 cores of processor",
    "quadcore": "Quad core processor will have 4 cores of processor for better performance",
    "3g": "3G can provide speed upto 5 Mbps/100Mbps",
    "4g": "4G is can give more speed compared to 3G,theoretically 500 Mbps/1Gbps.But practically it is possible only with LTE.",
    "lte": "LTE can provide more speed than 4G.",
    "li-ion": "lithium-ion batteries do suffer from aging – even when not in use.",
    "li-po": "Li-Polymer batteries allow for a slight increase in energy density,very lightweight and have improved safety.However, this advantage is offset by a 10% to 30% cost increase.",
    "aac": "AAC is a file format for storing digital audio. It's commonly used for storing music on the Internet, PCs and portable music players and phones.It is similar to MP3, but it was designed to be its successor and offers better quality and smaller file sizes. It also supports DRM, which enforces copyright.",
    "alac": "it is an audio coding format, and its reference audio codec implementation developed by Apple Inc. for lossless data compression of digital music",
    "gorilla": "Gorilla glass is mainly used for screen protection.It is designed to be thin, light and damage-resistant"
};

function haveKnowledge(key) {
    "use strict";

    return key in mapKnowledge;
}

function getKnowledge(key) {
    "use strict";

    return mapKnowledge[key];
}

var mapMerge = [["opinion", "sku"], [], []];
var rankedAttributeMappings = {
    processor: ['Apple A9', 'Qualcomm Snapdragon 820', 'Qualcomm Snapdragon 818', 'Exynos 8 Octa 8890', 'Exynos 7420 Octa', 'Qualcomm MSM8994 Snapdragon 810', 'Qualcomm Snapdragon 808', 'Qualcomm Snapdragon 805', 'Intel Atom Z3580', 'HiSilicon KIRIN 935', 'Qualcomm Snapdragon 650', 'Apple A7', 'MediaTek Helio X10 MT6795', 'Qualcomm Snapdragon 801', 'MediaTek MT6752M', 'Mediatek MT6735', 'Exynos 5410 Octa', 'Qualcomm Snapdragon 616', 'Qualcomm Snapdragon 615', 'Qualcomm Snapdragon 800', 'MediaTek Helio X10 MT6795', 'Mediatek MT6755 Helio P10', 'Qualcomm MSM8952 Snapdragon 617', 'Mediatek MT6592', 'Qualcomm Snapdragon 410', 'Mediatek MT6735', 'Qualcomm Snapdragon 410', 'Exynos 3 Quad 3475', 'Exynos 8 Octa 8890', 'Mediatek MT6580', 'MediaTek MT6582M', 'Qualcomm MSM8228', 'Qualcomm Snapdragon 200', 'MediaTek MT6572', 'Spreadtrum SC7731'],
    gpu: ['Qualcomm Adreno 530', 'PowerVR GT7600', 'Mali-T760MP8', 'Qualcomm Adreno 430', 'Mali-T760 MP6', 'PowerVR GX6450', 'Qualcomm Adreno 420', 'Qualcomm Adreno 418', 'PowerVR SGX544MP3', 'Adreno 330', 'PowerVR G6430 MP4', 'ARM Mali-T628 MP6', 'ARM Mali-T628 MP4', 'Arm Mali-T860 MP2', 'ARM Mali-T760 MP3', 'PowerVR G6200', 'Qualcomm Adreno 405', 'ARM Mali-T830', 'ARM Mali-T760 MP2', 'ARM Mali-T720 MP3', 'ARM Mali-T720 MP2', 'Qualcomm Adreno 306', 'ARM Mali-T760 MP8', 'Mali-450MP4', 'Qualcomm Adreno 305', 'Adreno 302', 'ARM Mali-400 MP4', 'ARM Mali-400 MP2', 'ARM Mali-400 MP1'],
    brand: ['Apple', 'Samsung', 'Motorola', 'Micromax', 'HTC Mobiles', 'Xiaomi', 'Microsoft', 'Sony', 'LG', 'Oppo', 'Lenovo', 'One plus', 'Gionee', 'Lava', 'Huawei', 'Asus', 'Yu', 'Coolpad', 'LeEco', 'Panasonic', 'BlacKBerry', 'XOLO', 'Google Mobile', 'Vivo', 'Meizu'],
    os: ['Android 6 Marshmallow', 'Android 5.1 lollipop', 'Android 5 Lollipop', 'Android 4.4 Kitkat', 'Android 4.3 Jelly Bean', 'Android 4.2 Jelly Bean', 'Android 4.1 Jelly Bean', 'iOS9', 'iOS8', 'iOS7', 'Windows 8.1']
};

function isrankedAttributeExists(key) {
    "use strict";

    return key in rankedAttributeMappings;
}
function getrankedAttribute(key) {
    "use strict";

    return rankedAttributeMappings[key];
}

function makePointers(functionName, sku, sku2) {
    var attributeList = ["RAM", "processor", "gpu", "os", "dual sim"];
    var attributeValueList = ["snapdragon", "android", "auto HDR", "micro sim", "gyroscope", "fingerprint"];
    var featureList = ["camera", "video", "display", "battery"];

    var pointerList = getFunctionPointers(functionName);
    for (var i = 0; i < pointerList.length; i++) {
        var rand;
        if (pointerList[i].indexOf("<<attribute>>") > -1) {
            rand = Math.floor(Math.random() * attributeList.length);
            pointerList[i] = pointerList[i].replace("<<attribute>>", attributeList[rand]);
        }

        if (pointerList[i].indexOf("<<aval>>") > -1) {
            rand = Math.floor(Math.random() * attributeValueList.length);
            pointerList[i] = pointerList[i].replace("<<aval>>", attributeValueList[rand]);
        }

        if (pointerList[i].indexOf("<<feature>>") > -1) {
            rand = Math.floor(Math.random() * featureList.length);
            pointerList[i] = pointerList[i].replace("<<feature>>", featureList[rand]);
        }

        if (pointerList[i].indexOf("<<sku>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku>>", sku);
        }

        if (pointerList[i].indexOf("<<sku2>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku2>>", sku2);
        }
    }
    pointerList = deleteDuplicates(pointerList);
    console.log(pointerList);
    return pointerList;
}
function deleteDuplicates(arr) {
    var tmp = [];
    for (var i = 0; i < arr.length; i++) {
        if (tmp.indexOf(arr[i]) == -1) {
            tmp.push(arr[i]);
        }
    }
    return tmp;
}

function getFunctionPointers(key) {
    return functionPointers[key];
}

var functionPointers = {
    "positiveSKU": ["Give me models with better <<sku>>", "Give me the highlights of <<sku>>", "Give me pros of <<sku>>", "What is the <<attribute>> of <<sku>>", "Expert reviews of <<sku>>", "How good is <<aval>>? "],
    "negativeSKU": ["Give me models with better <<sku>>", "Give me the highlights of <<sku>>", "Give me pros of <<sku>>", "What is the <<attribute>> of <<sku>>", "compare <<feature>> specs of <<sku>> and oneplus one", "Expert reviews of <<sku>>", "How good is <<aval>>? ", "compare <<sku>> with Moto g3"],
    "opinionSKU": ["Give me models with better <<sku>>", "Give me the highlights of <<sku>>", "Give me pros of <<sku>>", "What is the <<attribute>> of <<sku>>", "compare <<feature>> specs of <<sku>> and oneplus one", "Expert reviews of <<sku>>", "How good is <<aval>>? ", "compare <<sku>> with Moto g3"],
    "getAttributeValueSKU": ["what is <<attribute>> of <<sku>>", "Give me highlights of <<sku>>", "what's the  <<attribute>> of <<sku>> ?", "what are the pros of <<sku>> ?", "what are the <<feature>> specs of <<sku>>", "compare <<sku>> with galaxy s5", "compare <<feature>> specs of <<sku>> and oneplus one"],
    "getAttributeValueALL": ["what is <<attribute>> of <<sku>>", "Give me highlights of <<sku>>", "what's the  <<attribute>> of <<sku>> ?", "what are the pros of <<sku>> ?", "what are the <<feature>> specs of <<sku>>", "compare <<sku>> with galaxy s5", "compare <<feature>> specs of <<sku>> and oneplus one"],
    "singlePhoneDetails": ["Give me models with better <<sku>>", "Give me the highlights of <<sku>>", "Give me pros of <<sku>>", "What is the <<attribute>> of <<sku>>", "compare <<feature>> specs of <<sku>> and oneplus one", "Expert reviews of <<sku>>", "How good is <<aval>>? ", "compare <<sku>> with Moto g3"],
    "specsOfSKU": ["Give me models with better <<sku>>", "Give me the highlights of <<sku>>", "Give me pros of <<sku>>", "What is the <<attribute>> of <<sku>>", "compare <<feature>> specs of <<sku>> and oneplus one", "Expert reviews of <<sku>>", "How good is <<aval>>? ", "compare <<sku>> with Moto g3"],
    "specReview": ["what is <<attribute>> of <<sku>>", "Give me highlights of <<sku>>", "what's the  <<attribute>> of <<sku>> ?", "what are the pros of <<sku>> ?", "what are the <<feature>> specs of <<sku>>", "compare <<sku>> with galaxy s5", "compare <<feature>> specs of <<sku>> and oneplus one"],
    "knowledgeQuestion": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "howSpecs": ["Give me models with better <<sku>>", "Give me the highlights of <<sku>>", "Give me pros of <<sku>>", "What is the <<attribute>> of <<sku>>", "compare <<feature>> specs of <<sku>> and oneplus one", "Expert reviews of <<sku>>", "How good is <<aval>>? ", "compare <<sku>> with Moto g3"],
    "bestAttributeInMarket": ["what is <<attribute>> of <<sku>>", "Give me highlights of <<sku>>", "what's the  <<attribute>> of <<sku>> ?", "what are the pros of <<sku>> ?", "what are the <<feature>> specs of <<sku>>", "compare <<sku>> with galaxy s5", "compare <<feature>> specs of <<sku>> and oneplus one"],
    "SKUReview": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "publicTalk": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "buyPhone": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "negExpression": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "posExpression": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "ratingMobile": ["what is <<attribute>>", "Tell me about <<aval>>", "How good is <<aval>>", "what are the cons of <<aval>> ?", "what are the pros of <<aval>> ?"],
    "compareMobiles": ["Give me the highlights of <<sku>>", "Give me the highlights of <<sku2>>", "Pros of <<sku>>", "Pros of <<sku2>>", "What is the RAM of <<sku>>", "compare camera features of <<sku>> and <<sku2>>", "Expert reviews of <<sku>>", "how good is the camera of <<sku2>>"],
    "compareMobilesFeatures": ["Give me the highlights of <<sku1>>", "Give me the highlights of <<sku2>>", "Pros of <<sku>>", "Pros of <<sku2>>", "What is the RAM of <<sku>>", "compare camera features of <<sku>> and <<sku2>>", "Expert reviews of <<sku>>", "how good is the camera of <<sku2>>"],
    "betterPhoneInTwo": ["Expert reviews of <<sku>>", "Expert reviews of <<sku2>>", "Price of <<sku>>", "Models better than <<sku>>", "Reset your discovery by typing 'clear' and asking a fresh list of Qs", "Pros of <<sku>>", "Cons of <<sku>>"],
    "betterThanSKU": ["best samsung camera phones under 30k"],
    "findAllPhones": ["about 1", "compare 1 and 2", "camera specs of 1", "camera specs of 1 and 2", "Price of <<sku>>", "Expert reviews of <<sku>>", "compare camera features of <<sku>> and <<sku2>>", "clear chat"],
    "findGenderMobile": ["about 1", "compare 1 and 2", "camera specs of 1", "camera specs of 1 and 2", "Price of <<sku>>", "Expert reviews of <<sku>>", "compare camera features of <<sku>> and <<sku2>>", "clear chat"],
    "dimensionsSKU": ["best samsung camera phones under 30k"],
    "similarPhones": ["best samsung camera phones under 30k"],
    "checkAttributeSKU": ["Clear", "Give me the highlights of <<sku>>"],
    "helpMessage": ["best samsung camera phones under 30k"],
    "greet": ["best samsung camera phones under 30k"],
    "destroyEverything": ["best samsung camera phones under 30k"],
    "profanity": ["best samsung camera phones under 30k"]

};

var alphabetNumber = {
    this: "a",
    first: "a",
    second: "b",
    third: "c",
    fourth: "d",
    fifth: "e",
    sixth: "f",
    seventh: " g",
    eighth: "h"

};
function doesHaveAlphabet(key) {
    "use strict";

    return key in alphabetNumber;
}
function getNumberFromAlphabet(key) {
    "use strict";

    return alphabetNumber[key];
}

var mapUnits = {
    "internal_memory": "GB",
    "expandable_memory": "GB",
    "ram_memory": "GB",
    "battery_capacity": "mAh",
    "processor_frequency": "GHz",
    "height": "mm",
    "width": "mm",
    "thickness": "mm",
    "talk_time": "hours",
    "audio_jack": "mm",
    "screen_size": "inches",
    "primary_camera_resolution": "Mp",
    "video_resolution": "pixel",
    "rear_camera_resolution": "Mp",
    "no_of_cores": "core",
    front_camera_resolution: "Mp",
    display_resolution: "pixels",
    price: "Rupees",
    weight: 'grams'
};

function isUnitExists(key) {
    "use strict";

    return key in mapUnits;
}
function getUnitKey(key) {
    "use strict";

    if (!isUnitExists(key)) return "";
    return mapUnits[key];
}

var mapAlphabets = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10
};

var noNoWords = ["if", "but", "until", "not", "nor", "yet", "unless", "doesn't", "don't", "didn't", "can't", "whether", "as musch as", "where as", "because", "besides", "however", "neverthless", "nonetheless", "instead", "otherwise", "rather", "accordingly", "consequently", "hence", "meanwhile", "furthermore", "likewise"];
var noNoWordOr = ['or'];
var noNoWordNo = ['no'];

function getAlphabet(key) {
    "use strict";

    return mapAlphabets[key];
}

var mapnumeric = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5

};

function getnumeric(key) {
    "use strict";

    return mapnumeric[key];
}
module.exports = {
    getDbKey: getDbKey,
    isDbKeyExists: isDbKeyExists,
    isUnitExists: isUnitExists,
    getUnitKey: getUnitKey,
    getAlphabet: getAlphabet,
    isSpecSortKeyExists: isSpecSortKeyExists,
    specSortValue: specsSortValue,
    getFieldsAttribute: getFieldsAttribute,
    getPastTime: getPastTime,
    queryValue: queryValue,
    getSpecScores: getSpecScores,
    getSKUKey: getSKUKey,
    doesSKUKeyExists: doesSKUKeyExists,
    isHaveRank: isHaveRank,
    getRank: getRank,
    haveKnowledge: haveKnowledge,
    getKnowledge: getKnowledge,
    hasSpecScores: hasSpecScores,
    isReasonExists: isReasonExists,
    getReasonMessage: getReasonMessage,
    isrankedAttributeExists: isrankedAttributeExists,
    getrankedAttribute: getrankedAttribute,
    getnumeric: getnumeric,
    getNumberFromAlphabet: getNumberFromAlphabet,
    doesHaveAlphabet: doesHaveAlphabet,
    isQueryExists: isQueryExists,
    getFunctionPointers: getFunctionPointers,
    mapUnits: mapUnits,
    noNoWords: noNoWords,
    noNoWordOr: noNoWordOr,
    noNoWordNo: noNoWordNo,
    makePointers: makePointers,
    hasReleventAttriubte: hasReleventAttriubte,
    getRelevantAttribute: getRelevantAttribute
};

//# sourceMappingURL=mapping-compiled.js.map

//# sourceMappingURL=mapping-compiled-compiled.js.map