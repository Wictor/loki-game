export class WordBank {
  private categories: Map<string, string[]>;

  constructor() {
    this.categories = new Map();

    this.categories.set('animals', [
      'dog', 'cat', 'elephant', 'lion', 'tiger', 'bear', 'monkey', 'giraffe',
      'zebra', 'penguin', 'dolphin', 'whale', 'shark', 'eagle', 'parrot',
      'rabbit', 'horse', 'cow', 'pig', 'sheep', 'goat', 'deer', 'wolf',
      'fox', 'owl', 'frog', 'snake', 'turtle', 'octopus', 'jellyfish',
      'butterfly', 'bee', 'ant', 'spider', 'crab', 'lobster', 'kangaroo',
      'koala', 'panda', 'hippo', 'rhino', 'crocodile', 'flamingo', 'peacock',
      'hamster', 'squirrel', 'bat', 'seal', 'otter', 'chameleon',
      'mouse', 'rat', 'beaver', 'raccoon', 'chipmunk', 'hedgehog', 'skunk',
      'moose', 'reindeer', 'camel', 'llama', 'alpaca', 'donkey', 'mule',
      'buffalo', 'yak', 'gorilla', 'chimpanzee', 'orangutan', 'lemur',
      'sloth', 'armadillo', 'porcupine', 'anteater', 'platypus', 'wombat',
      'dodo', 'ostrich', 'emu', 'pelican', 'toucan', 'hummingbird', 'swan',
      'duck', 'goose', 'chicken', 'rooster', 'turkey', 'quail', 'pigeon',
      'seagull', 'raven', 'crow', 'woodpecker', 'stork', 'vulture', 'hawk',
    ]);

    this.categories.set('food', [
      'pizza', 'burger', 'pasta', 'sushi', 'salad', 'steak', 'chicken',
      'rice', 'bread', 'cheese', 'apple', 'banana', 'orange', 'grape',
      'strawberry', 'watermelon', 'pineapple', 'mango', 'avocado', 'tomato',
      'potato', 'carrot', 'broccoli', 'corn', 'mushroom', 'onion', 'garlic',
      'chocolate', 'ice cream', 'cake', 'cookie', 'donut', 'pancake', 'waffle',
      'taco', 'burrito', 'sandwich', 'soup', 'noodles', 'dumpling',
      'popcorn', 'pretzel', 'hot dog', 'french fries', 'egg', 'bacon',
      'lobster', 'shrimp', 'salmon', 'coconut',
      'bagel', 'croissant', 'muffin', 'cupcake', 'brownie', 'pie', 'churro',
      'pear', 'peach', 'plum', 'cherry', 'blueberry', 'raspberry', 'kiwi',
      'lemon', 'lime', 'grapefruit', 'papaya', 'melon', 'dragonfruit',
      'burrito bowl', 'quesadilla', 'nachos', 'chips', 'salsa', 'guacamole',
      'ramen', 'pho', 'dim sum', 'spring roll', 'tempura', 'bento box',
      'lasagna', 'ravioli', 'spaghetti', 'macaroni', 'gnocchi', 'risotto',
      'kebab', 'falafel', 'hummus', 'pita', 'tzatziki', 'gyro',
      'milkshake', 'smoothie', 'latte', 'cappuccino', 'espresso', 'tea',
    ]);

    this.categories.set('objects', [
      'table', 'chair', 'lamp', 'phone', 'computer', 'book', 'pen', 'clock',
      'mirror', 'bottle', 'key', 'wallet', 'camera', 'guitar', 'bicycle',
      'umbrella', 'glasses', 'hat', 'shoe', 'backpack', 'pillow', 'blanket',
      'candle', 'scissors', 'hammer', 'ladder', 'broom', 'bucket', 'rope',
      'balloon', 'envelope', 'newspaper', 'map', 'compass', 'telescope',
      'microscope', 'trophy', 'crown', 'sword', 'shield', 'drum', 'violin',
      'piano', 'headphones', 'microphone', 'remote control', 'toothbrush',
      'doorbell', 'lightbulb', 'battery', 'magnet',
      'sofa', 'bed', 'desk', 'shelf', 'drawer', 'cabinet', 'wardrobe',
      'painting', 'frame', 'vase', 'plant pot', 'rug', 'curtain', 'fan',
      'heater', 'air conditioner', 'vacuum', 'iron', 'washing machine',
      'refrigerator', 'oven', 'toaster', 'blender', 'kettle', 'teapot',
      'calculator', 'stapler', 'tape', 'ruler', 'notebook', 'pencil',
      'eraser', 'sharpener', 'suitcase', 'briefcase', 'purse',
      'toolbox', 'drill', 'saw', 'wrench', 'screwdriver', 'pliers', 'axe',
      'shovel', 'rake', 'hose', 'sprinkler', 'wheelbarrow', 'lawnmower',
    ]);

    this.categories.set('places', [
      'beach', 'mountain', 'forest', 'city', 'park', 'library', 'museum',
      'restaurant', 'hospital', 'school', 'airport', 'stadium', 'theater',
      'mall', 'zoo', 'castle', 'church', 'farm', 'island', 'volcano',
      'desert', 'jungle', 'cave', 'waterfall', 'bridge', 'lighthouse',
      'prison', 'palace', 'temple', 'pyramid', 'train station', 'subway',
      'harbor', 'playground', 'gym', 'cinema', 'bakery', 'garage',
      'garden', 'rooftop', 'basement', 'attic', 'balcony', 'fountain',
      'cemetery', 'skyscraper', 'igloo', 'treehouse', 'carnival', 'aquarium',
      'bank', 'post office', 'supermarket', 'gas station', 'hotel', 'motel',
      'cafe', 'diner', 'bar', 'nightclub', 'casino', 'arcade',
      'bowling alley', 'ice rink', 'swimming pool', 'spa', 'salon',
      'factory', 'warehouse', 'dock', 'pier', 'marina', 'shipyard',
      'observatory', 'planetarium', 'laboratory', 'greenhouse', 'nursery',
      'ranch', 'vineyard', 'orchard', 'windmill', 'dam', 'power plant',
      'laundromat', 'dry cleaner', 'pawn shop', 'pharmacy', 'bookstore',
    ]);

    this.categories.set('actions', [
      'run', 'jump', 'swim', 'fly', 'dance', 'sing', 'read', 'write',
      'cook', 'sleep', 'drive', 'climb', 'paint', 'talk', 'laugh',
      'cry', 'sneeze', 'yawn', 'whistle', 'clap', 'wave', 'hug',
      'kick', 'throw', 'catch', 'dig', 'pour', 'stir', 'chop',
      'knit', 'sew', 'juggle', 'surf', 'ski', 'skateboard', 'fish',
      'hunt', 'camp', 'hike', 'meditate', 'stretch', 'lift', 'push',
      'pull', 'blow', 'wink', 'bow', 'salute', 'roll', 'spin',
      'cartwheel', 'backflip', 'handstand', 'tiptoe', 'crawl', 'hop',
      'skip', 'march', 'strut', 'stumble', 'trip', 'slide', 'lean',
      'bend', 'squat', 'kneel', 'crouch', 'dunk', 'shoot', 'tackle',
      'block', 'dodge', 'punch', 'slap', 'tickle', 'poke', 'pinch',
      'scratch', 'shrug', 'nod', 'shake head', 'point', 'snap fingers',
      'high five', 'fist bump', 'thumbs up', 'peace sign', 'rock on',
      'eat', 'drink', 'bite', 'chew', 'sip', 'gulp', 'lick', 'taste',
    ]);

    this.categories.set('vehicles', [
      'car', 'bus', 'train', 'airplane', 'helicopter', 'motorcycle',
      'bicycle', 'boat', 'ship', 'submarine', 'rocket', 'hot air balloon',
      'skateboard', 'scooter', 'ambulance', 'fire truck', 'police car',
      'taxi', 'tractor', 'bulldozer', 'crane', 'forklift', 'jet ski',
      'canoe', 'sailboat', 'gondola', 'cable car', 'sled', 'unicycle',
      'tank', 'spaceship', 'hovercraft', 'segway', 'rickshaw', 'chariot',
      'limousine', 'convertible', 'pickup truck', 'van', 'minivan', 'suv',
      'monster truck', 'race car', 'go-kart', 'dune buggy', 'snowmobile',
      'yacht', 'cruise ship', 'ferry', 'speedboat', 'rowboat', 'kayak',
      'raft', 'houseboat', 'tugboat', 'battleship', 'aircraft carrier',
      'blimp', 'glider', 'hang glider', 'parachute', 'fighter jet', 'drone',
      'trolley', 'monorail', 'steam train', 'bullet train', 'tram',
      'dump truck', 'cement mixer', 'excavator', 'backhoe', 'steamroller',
      'golf cart', 'shopping cart', 'wheelchair', 'stroller', 'wagon',
    ]);

    this.categories.set('professions', [
      'doctor', 'teacher', 'firefighter', 'police officer', 'chef',
      'pilot', 'astronaut', 'farmer', 'painter', 'musician', 'dancer',
      'athlete', 'photographer', 'dentist', 'nurse', 'veterinarian',
      'mechanic', 'electrician', 'plumber', 'carpenter', 'architect',
      'scientist', 'judge', 'detective', 'magician', 'clown', 'pirate',
      'knight', 'ninja', 'samurai', 'cowboy', 'lifeguard', 'barber',
      'baker', 'butcher', 'waiter', 'DJ', 'surgeon', 'librarian',
      'mailman', 'delivery driver', 'taxi driver', 'truck driver',
      'sailor', 'captain', 'soldier', 'general', 'spy', 'superhero',
      'reporter', 'anchor', 'weatherman', 'actor', 'director', 'producer',
      'comedian', 'juggler', 'acrobat', 'tightrope walker', 'stunt person',
      'coach', 'referee', 'umpire', 'trainer', 'bodyguard', 'bouncer',
      'lawyer', 'accountant', 'banker', 'CEO', 'secretary', 'receptionist',
      'janitor', 'gardener', 'florist', 'bartender', 'sommelier',
      'tailor', 'cobbler', 'blacksmith', 'jeweler', 'watchmaker',
    ]);

    this.categories.set('nature', [
      'sun', 'moon', 'star', 'cloud', 'rainbow', 'lightning', 'tornado',
      'volcano', 'earthquake', 'tsunami', 'avalanche', 'river', 'lake',
      'ocean', 'waterfall', 'glacier', 'desert', 'forest', 'meadow',
      'swamp', 'coral reef', 'geyser', 'canyon', 'cliff', 'cave',
      'mushroom', 'cactus', 'palm tree', 'rose', 'sunflower', 'tulip',
      'snowflake', 'icicle', 'aurora', 'comet', 'meteor', 'eclipse',
      'wind', 'storm', 'blizzard', 'fog', 'mist', 'dew', 'frost',
      'hail', 'rain', 'snow', 'thunder', 'hurricane', 'typhoon',
      'mountain peak', 'valley', 'hill', 'dune', 'boulder', 'pebble',
      'sand', 'mud', 'quicksand', 'lava', 'magma', 'hot spring',
      'pond', 'stream', 'creek', 'rapids', 'tide pool', 'bay',
      'oak tree', 'pine tree', 'willow tree', 'bamboo', 'fern', 'moss',
      'ivy', 'vine', 'lily', 'orchid', 'daisy', 'dandelion', 'clover',
      'wheat', 'grass', 'reed', 'seaweed', 'algae', 'plankton',
    ]);

    this.categories.set('sports', [
      'soccer', 'basketball', 'tennis', 'baseball', 'volleyball',
      'golf', 'bowling', 'boxing', 'wrestling', 'karate', 'fencing',
      'archery', 'surfing', 'skiing', 'snowboarding', 'ice skating',
      'hockey', 'rugby', 'cricket', 'badminton', 'table tennis',
      'diving', 'gymnastics', 'weightlifting', 'cycling', 'horse riding',
      'rock climbing', 'skateboarding', 'sailing', 'rowing', 'darts',
      'football', 'lacrosse', 'field hockey', 'water polo', 'handball',
      'curling', 'bobsled', 'luge', 'biathlon', 'triathlon', 'marathon',
      'pole vault', 'high jump', 'long jump', 'javelin', 'discus', 'shot put',
      'hurdles', 'relay race', 'sprint', 'judo', 'taekwondo', 'kickboxing',
      'motocross', 'bmx', 'mountain biking', 'roller derby',
      'frisbee', 'ultimate frisbee', 'croquet', 'bocce ball', 'shuffleboard',
      'pickleball', 'squash', 'racquetball', 'polo', 'rodeo', 'bull riding',
      'parkour', 'free running', 'bungee jumping', 'skydiving', 'hang gliding',
    ]);

    this.categories.set('movies & tv', [
      'superhero', 'zombie', 'vampire', 'werewolf', 'ghost', 'alien',
      'robot', 'dinosaur', 'dragon', 'mermaid', 'wizard', 'witch',
      'fairy', 'giant', 'dwarf', 'elf', 'troll', 'unicorn', 'phoenix',
      'centaur', 'minotaur', 'cyclops', 'grim reaper', 'angel', 'demon',
      'frankenstein', 'yeti', 'bigfoot', 'kraken', 'sphinx', 'griffin',
      'godzilla', 'king kong', 'mummy', 'skeleton', 'gargoyle', 'golem',
      'leprechaun', 'gnome', 'goblin', 'orc', 'ogre', 'hydra', 'medusa',
      'pegasus', 'cerberus', 'basilisk', 'banshee', 'genie', 'djinn',
      'time traveler', 'cyborg', 'android', 'hologram', 'clone', 'mutant',
      'ninja', 'samurai', 'gladiator', 'viking', 'spartan', 'barbarian',
      'cowboy', 'gangster', 'spy', 'detective', 'mad scientist', 'villain',
      'sidekick', 'damsel', 'princess', 'prince', 'king', 'queen',
      'pirate captain', 'space marine', 'jedi', 'sith', 'bounty hunter',
    ]);

    this.categories.set('music', [
      'guitar', 'piano', 'drums', 'violin', 'trumpet', 'flute',
      'saxophone', 'harp', 'cello', 'accordion', 'banjo', 'ukulele',
      'harmonica', 'xylophone', 'tambourine', 'maracas', 'tuba',
      'clarinet', 'bagpipes', 'bongo', 'triangle', 'kazoo', 'organ',
      'mandolin', 'didgeridoo', 'sitar', 'microphone', 'headphones',
      'electric guitar', 'bass guitar', 'bass drum', 'snare drum', 'cymbals',
      'timpani', 'gong', 'chimes', 'cowbell', 'castanets', 'wood block',
      'vibraphone', 'marimba', 'steel drum', 'djembe', 'congas', 'tabla',
      'trombone', 'french horn', 'oboe', 'piccolo', 'recorder', 'pan flute',
      'synthesizer', 'keyboard', 'electric piano', 'turntable', 'mixer',
      'amplifier', 'speaker', 'metronome', 'tuning fork', 'music stand',
      'baton', 'pick', 'bow', 'reed', 'mouthpiece', 'drumstick',
      'sheet music', 'musical note', 'treble clef', 'bass clef', 'microphone stand',
    ]);

    this.categories.set('clothing', [
      'shirt', 'pants', 'dress', 'skirt', 'jacket', 'coat', 'sweater',
      'hoodie', 'hat', 'cap', 'scarf', 'gloves', 'socks', 'boots',
      'sandals', 'sneakers', 'high heels', 'tie', 'bow tie', 'belt',
      'bikini', 'swimsuit', 'pajamas', 'robe', 'apron', 'crown',
      'helmet', 'sunglasses', 'watch', 'ring', 'necklace', 'bracelet',
      't-shirt', 'tank top', 'blouse', 'cardigan', 'vest', 'blazer',
      'tuxedo', 'suit', 'shorts', 'jeans', 'leggings', 'sweatpants',
      'tracksuit', 'jumpsuit', 'overalls', 'poncho', 'cape', 'cloak',
      'bandana', 'beanie', 'beret', 'fedora', 'sombrero', 'top hat',
      'mittens', 'earmuffs', 'headband', 'wristband', 'ankle bracelet',
      'earrings', 'nose ring', 'brooch', 'cufflinks', 'tiara', 'veil',
      'slippers', 'flip flops', 'clogs', 'loafers', 'moccasins', 'ballet flats',
      'raincoat', 'windbreaker', 'parka', 'trench coat', 'leather jacket',
      'suspenders', 'cummerbund', 'sash', 'shawl', 'stole',
    ]);

    this.categories.set('random', [
      'birthday party', 'treasure map', 'time machine', 'haunted house',
      'roller coaster', 'campfire', 'snowman', 'scarecrow', 'traffic jam',
      'solar system', 'black hole', 'lava lamp', 'disco ball', 'jack-o-lantern',
      'christmas tree', 'ferris wheel', 'bunk bed', 'quicksand', 'mousetrap',
      'sandcastle', 'igloo', 'treehouse', 'hammock', 'trampoline',
      'boomerang', 'parachute', 'zipline', 'slingshot', 'catapult',
      'maze', 'jigsaw puzzle', 'pinata', 'snow globe', 'kaleidoscope',
      'bubble bath', 'pillow fight', 'food fight', 'paper airplane', 'origami',
      'fortune cookie', 'vending machine', 'shopping cart', 'parking meter',
      'fire hydrant', 'mailbox', 'trash can', 'dumpster', 'recycling bin',
      'street sign', 'stop sign', 'speed bump', 'pothole', 'manhole cover',
      'flagpole', 'banner', 'billboard', 'neon sign', 'traffic light',
      'bench', 'picnic table', 'swing set', 'seesaw', 'slide', 'monkey bars',
      'sandbox', 'wishing well', 'bird bath', 'sundial', 'weather vane',
      'bird house', 'dog house', 'wind chime',
      'garden gnome', 'flamingo lawn ornament', 'tiki torch', 'porch swing',
      'doormat', 'welcome mat', 'fence', 'gate', 'stepping stone',
    ]);
  }

  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  getWordsByCategory(category: string): string[] {
    const words = this.categories.get(category);
    if (!words) {
      throw new Error(`Category '${category}' not found`);
    }
    return words;
  }

  getRandomWord(category: string): string {
    const words = this.getWordsByCategory(category);
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }

  addCategory(name: string, words: string[]): void {
    this.categories.set(name, words);
  }
}
