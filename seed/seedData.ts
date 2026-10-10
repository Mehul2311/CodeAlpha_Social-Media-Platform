import bcrypt from 'bcryptjs';
import { getDatabase } from '../db/database.ts';

export async function seed() {
  const db = await getDatabase();

  // Check if posts already seeded
  const existingPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get();
  if (existingPosts && existingPosts.count >= 25) {
    console.log(`Database already contains ${existingPosts.count} posts. Skipping seed.`);
    return;
  }

  // Clear any incomplete data to ensure referential integrity
  db.exec('DELETE FROM comments; DELETE FROM likes; DELETE FROM followers; DELETE FROM posts; DELETE FROM users;');

  console.log('Seeding Chaupal database with Indian users, posts, comments and interactions...');

  const defaultPassword = 'password123';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(defaultPassword, salt);

  const users = [
    {
      username: 'aarav_sharma',
      name: 'Aarav Sharma',
      email: 'aarav@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Tech enthusiast, chai aficionado & exploring old Delhi bylanes. Built my first app in college! ☕💻',
      city: 'New Delhi, Delhi'
    },
    {
      username: 'priya.nair',
      name: 'Priya Nair',
      email: 'priya@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Kathakali dancer, marine biology researcher, and filter coffee loyalist. Backwaters & books! 🌊📖',
      city: 'Kochi, Kerala'
    },
    {
      username: 'rohan_pune',
      name: 'Rohan Deshmukh',
      email: 'rohan@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'FC Road regular, weekend trekker in Sahyadris. Running a boutique design studio in Kothrud. ⛰️🎨',
      city: 'Pune, Maharashtra'
    },
    {
      username: 'ananya_b',
      name: 'Ananya Banerjee',
      email: 'ananya@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Rabindra sangeet enthusiast, puchka lover at Vivekananda park, journalism postgrad student. 📚🚋',
      city: 'Kolkata, West Bengal'
    },
    {
      username: 'harpreet_pb',
      name: 'Harpreet Singh',
      email: 'harpreet@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      bio: 'Agri-tech innovator, tractor enthusiast, and paratha connoisseur. Rab Rakha! 🚜🌾',
      city: 'Ludhiana, Punjab'
    },
    {
      username: 'lakshmi.iyer',
      name: 'Lakshmi Iyer',
      email: 'lakshmi@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
      bio: 'Carnatic vocal student, filter kaapi purist, walking along Marina beach at 6 AM. 🎶🥥',
      city: 'Chennai, Tamil Nadu'
    },
    {
      username: 'imran_hyd',
      name: 'Imran Khan',
      email: 'imran@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Biryani critic, software engineer in Hitec City, poet in late hours. Irani chai over everything. ☕✨',
      city: 'Hyderabad, Telangana'
    },
    {
      username: 'tanvi_k',
      name: 'Tanvi Kulkarni',
      email: 'tanvi@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Catching the 8:42 fast local from Borivali. Building consumer apps, dreaming of Marine Drive sunsets. 🚇🌊',
      city: 'Mumbai, Maharashtra'
    },
    {
      username: 'vikram_jaipur',
      name: 'Vikram Rathore',
      email: 'vikram@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      bio: 'Heritage architecture photographer, blue pottery collector, hunting for best pyaaz kachori. 📸🏰',
      city: 'Jaipur, Rajasthan'
    },
    {
      username: 'devika_blr',
      name: 'Devika Menon',
      email: 'devika@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
      bio: 'Product manager in Koramangala. Stuck on Silk Board, sipping CTR benne dose, plotting next startup. 🛵🥞',
      city: 'Bengaluru, Karnataka'
    },
    {
      username: 'kabir_lucknow',
      name: 'Kabir Verma',
      email: 'kabir@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
      bio: 'Tehzeeb, Galawati kebabs, and Urdu shayaris. History researcher wandering around Bara Imambara. 🏛️✒️',
      city: 'Lucknow, Uttar Pradesh'
    },
    {
      username: 'meera_amd',
      name: 'Meera Patel',
      email: 'meera@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Navratri garba dancer all 9 nights! Textile designer & midnight foodie at Manek Chowk. 🪡✨',
      city: 'Ahmedabad, Gujarat'
    },
    {
      username: 'aryan_dehradun',
      name: 'Aryan Bhatt',
      email: 'aryan@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      bio: 'Ruskin Bond reader, mountain trails lover, steaming maggi at Mussoorie viewpoints. 🌲🎒',
      city: 'Dehradun, Uttarakhand'
    },
    {
      username: 'sneha_guwahati',
      name: 'Sneha Barua',
      email: 'sneha@chaupal.in',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Tea gardens, Brahmaputra sunsets, indie folk music, exploring Northeast handloom art. 🍃🎸',
      city: 'Guwahati, Assam'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (username, name, email, password_hash, avatar, bio, city, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);

  users.forEach((u, idx) => {
    const daysAgo = 100 - idx * 5;
    insertUser.run(u.username, u.name, u.email, passwordHash, u.avatar, u.bio, u.city, daysAgo);
  });

  const allUsers = db.prepare('SELECT id, username FROM users ORDER BY id ASC').all();
  const userIds: number[] = allUsers.map((u: any) => u.id);

  console.log(`Inserted and fetched ${userIds.length} users.`);

  // 32 Indian posts covering various aspects of life, food, tech, festivals, culture
  const postsData = [
    {
      userIndex: 7, // Tanvi - Mumbai
      content: 'Cutting chai and garma-garam kanda bhaji while listening to rain pouring on the tin roof of Dadar station. Kuch bhi kaho, Mumbai rains have an unmatched poetry when you are safe inside with a hot cup! ☕🌧️ #MumbaiRains #ChaiTime #AamchiMumbai',
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 2
    },
    {
      userIndex: 0, // Aarav - Delhi
      content: 'Last over, 13 needed, and Virat Kohli is on strike. Heart rate at 180 bpm! Indian cricket matches are truly not for the faint-hearted. Pure goosebumps every single ball! 🏏🔥 #IPLFever #CricketMeriJaan #TeamIndia',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 5
    },
    {
      userIndex: 9, // Devika - Bengaluru
      content: 'Peak Bengaluru moment: Just pitched my AI agent idea to an angel investor while sharing a table at Rameshwaram Cafe, holding crispy ghee podi idli in one hand and filter coffee in another. Only in Namma Bengaluru! 🚀🥞 #StartupLife #BangaloreTech #NammaBengaluru',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 8
    },
    {
      userIndex: 10, // Kabir - Lucknow
      content: 'Hazratganj ki shaam aur Tunday Kababi ke galawati kebabs. Yeh jo maza hai, yeh sirf Lucknow ke dastarkhwan pe hi mil sakta hai. Pehle aap, baad me aap! 🍽️✨ #DesiFood #LucknowDiaries #AwadhCulture',
      imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 12
    },
    {
      userIndex: 4, // Harpreet - Ludhiana
      content: 'Subah subah khetan di taazi hava, makki di roti te sarson da saag with homemade white makkhan! Punjab vich aake energy alag hi level te hundi hai. Rab sab nu khushiyan bakhshe! 🚜🌾 #PunjabDiaries #DesiFood #FarmLife',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 16
    },
    {
      userIndex: 1, // Priya - Kochi
      content: 'There is nothing quite like waking up in Fort Kochi, hearing the gentle waves lap against the Chinese fishing nets, and taking the first sip of piping hot Kerala filter kaapi. Solitude at its finest. 🌊☕ #GodsOwnCountry #KochiVibes #FilterCoffee',
      imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 20
    },
    {
      userIndex: 2, // Rohan - Pune
      content: 'Early morning trek to Sinhagad Fort completed before 8 AM! The cool Sahyadri breeze and hot kanda poha at the top make every steep step worth it. Punekars know the Sunday drill. ⛰️🍃 #PuneTrekkers #Sahyadri #Punekar',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 24
    },
    {
      userIndex: 3, // Ananya - Kolkata
      content: 'College Street boi para on a Saturday afternoon! Found a vintage 1972 edition of Rabindranath Tagore poems for just ₹60. Celebrated with sweet telebhaja and clay pot cha. Kolkata has preserved its soul so lovingly. 📚🍵 #CollegeStreet #CalcuttaDiaries #Boipara',
      imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 30
    },
    {
      userIndex: 5, // Lakshmi - Chennai
      content: 'Margazhi season is beginning soon! Early morning kacheri at the sabha, crisp Kanjeevaram sarees, fragrant jasmine flowers (malli poo), and divine temple prasad. Chennai during December-January is pure magic! 🌸🎶 #Margazhi #CarnaticMusic #SingaraChennai',
      imageUrl: 'https://images.unsplash.com/photo-1609137144822-777265584ec6?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 36
    },
    {
      userIndex: 6, // Imran - Hyderabad
      content: 'Midnight debate with friends in Charminar: Paradise vs Bawarchi vs Shadab. Finally agreed that the real winner is the late-night Irani chai with Osmania biscuits at Nimrah Cafe. Dil khush ho gaya! ☕🏛️ #HyderabadBiryani #IraniChai #Charminar',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 42
    },
    {
      userIndex: 8, // Vikram - Jaipur
      content: 'Golden hour lights at Hawa Mahal. 953 jharokhas catching the warm desert sun! It blows my mind how Rajput architects built natural air-conditioning centuries ago with pure airflow design. 🏰✨ #JaipurArchitecture #IncredibleIndia #PinkCity',
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 48
    },
    {
      userIndex: 11, // Meera - Ahmedabad
      content: '9 nights of non-stop Garba, chaniya choli colors swirling under the festival lights, and late night jalebi fafda at 3 AM! Gujarat during Navratri feels like the happiest place on Earth. Kem Chho Chaupal fam? 💃🪔 #NavratriNights #GarbaVibes #GujaratTourism',
      imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 54
    },
    {
      userIndex: 12, // Aryan - Dehradun
      content: 'Sitting in a wooden attic in Mussoorie listening to old Kishore Kumar songs while the mist rolls across the pine valleys. Ruskin Bond was right: once the mountains are in your blood, you never really leave. 🌲⛰️ #Himalayas #PahadiVibes #Mussoorie',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 60
    },
    {
      userIndex: 13, // Sneha - Guwahati
      content: 'Evening ferry ride across the mighty Brahmaputra river. The crimson sky reflecting on the water while someone plays the Bihu dhol in the distance. Northeast India has endless beauty waiting to be explored. 🌅🍃 #Brahmaputra #AssamDiaries #IncredibleNortheast',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 70
    },
    {
      userIndex: 0, // Aarav - Delhi
      content: 'Engineering college legend: completing the entire 500-page syllabus one night before the end-sem exam on a diet of Maggi and high-octane playlist. Miracles happen between 2 AM and 6 AM! Kaun kaun relate kar sakta hai? 😂📚 #EngineeringLife #ExamSeason #DesiCollege',
      imageUrl: '',
      hoursAgo: 75
    },
    {
      userIndex: 7, // Tanvi - Mumbai
      content: 'Local train etiquette 101: Never ever stand at the doorway if you aren\'t getting off at Dadar or Kurla. You will be launched out by kinetic human energy alone! 😂🚆 #MumbaiLocal #Lifeline #DailyHustle',
      imageUrl: '',
      hoursAgo: 82
    },
    {
      userIndex: 9, // Devika - Bengaluru
      content: 'Silk Board flyover is not just a traffic junction, it is a spiritual test of patience and meditation. Finished two podcasts and half a book today in the cab. 🧘‍♀️🚗 #BangaloreTraffic #PeakBangalore #SilkBoard',
      imageUrl: '',
      hoursAgo: 90
    },
    {
      userIndex: 2, // Rohan - Pune
      content: 'Unpopular opinion: Pune\'s 1 PM to 4 PM afternoon nap (Sustaane ka time) is the greatest cultural tradition ever invented. Productivity after 4 PM with a cup of Amrutulya tea hits differently! 💤☕ #PunekarPride #ChaiTime',
      imageUrl: '',
      hoursAgo: 98
    },
    {
      userIndex: 1, // Priya - Kochi
      content: 'Sadya served on a clean plantain leaf with 24 distinct curries, topped with hot ghee and parippu, finished off with golden Ada Pradhaman payasam. This is culinary perfection engineered over centuries. 🍛🍌 #KeralaSadya #OnamVibes #DesiFood',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 105
    },
    {
      userIndex: 10, // Kabir - Lucknow
      content: '‘Yeh dilli hai mere yaar, bas ishq mohabbat pyaar’ or Lucknow ki meethi tehzeeb? Words carry so much grace when spoken with respectful adab. Apno ke saath baat karne ka lutf hi kuch aur hai. 🌸📜 #Tehzeeb #ChaupalVichar #Shayari',
      imageUrl: '',
      hoursAgo: 112
    },
    {
      userIndex: 4, // Harpreet - Ludhiana
      content: 'Dhaba chai on the Grand Trunk road (GT Road) at 3 AM with lachha parathas dripping in fresh butter. Truck drivers playing classic Gurdas Maan songs on the radio. Road trips in North India are legendary! 🛣️☕ #GTRoad #PunjabFood #NightDrive',
      imageUrl: '',
      hoursAgo: 120
    },
    {
      userIndex: 5, // Lakshmi - Chennai
      content: 'Chennai heat in May: 🔥 Chennai breeze at Besant Nagar beach in November: 🕊️ Sitting by the shore watching the lighthouse beam sweeping across the Bay of Bengal. Pure calm. #SingaraChennai #BeachLife #Madras',
      imageUrl: '',
      hoursAgo: 130
    },
    {
      userIndex: 8, // Vikram - Jaipur
      content: 'Kachori lovers assemble! Dal kachori with tangy tamarind chutney or pyaz kachori with spicy green coriander chutney? In Jaipur, this is more serious than politics! 🥟🌶️ #DesiFood #StreetFoodIndia #JaipurBites',
      imageUrl: '',
      hoursAgo: 140
    },
    {
      userIndex: 11, // Meera - Ahmedabad
      content: 'Textile magic in Patan: Watching the master weavers create double-ikat Patola sarees where both sides look exactly identical! Months of painstaking hand calculation. Indian craftsmanship is unmatched in the world. 🧵🪡 #IndianHandlooms #Patola #MakeInIndia',
      imageUrl: '',
      hoursAgo: 150
    },
    {
      userIndex: 6, // Imran - Hyderabad
      content: 'Rain in Hyderabad and an evening drive over Durgam Cheruvu cable bridge! The skyline lights reflect on the lake just like Singapore, but you can still stop for spicy mirchi bajji right around the corner. 🌉🌶️ #HyderabadVibes #HitecCity #Monsoon',
      imageUrl: '',
      hoursAgo: 160
    },
    {
      userIndex: 3, // Ananya - Kolkata
      content: 'Durga Puja pandal hopping all night on Ashtami! The sound of dhak drums vibrating right through your chest, the fragrance of dhunuchi smoke, and the radiant face of Maa Durga. No festival in the world can replicate this electric energy! 🥁🙏 #DurgaPuja #PujoVibes #KolkataDurgotsav',
      imageUrl: 'https://images.unsplash.com/photo-1570776703565-d6d71b305282?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 170
    },
    {
      userIndex: 0, // Aarav - Delhi
      content: 'Winter is coming to North India! Which means: hot kulhad chai, gajar ka halwa simmered in milk for 4 hours, and soaking in the gentle afternoon dhoop on the terrace with family. Pure bliss. 🥕🥣☀️ #DelhiWinter #DesiFood #FamilyTime',
      imageUrl: '',
      hoursAgo: 180
    },
    {
      userIndex: 12, // Aryan - Dehradun
      content: 'Steaming bowl of spicy Wai-Wai noodles with boiled egg at Landour bakehouse after a brisk 10 km mountain jog. Cool pine air hitting your face. Life is simple when you keep your wants small! 🍜🌲 #MountainLife #Landour #FitnessDesi',
      imageUrl: '',
      hoursAgo: 190
    },
    {
      userIndex: 13, // Sneha - Guwahati
      content: 'Brewing fresh orthodox Assam golden tips tea this morning. The aroma of rich malt and floral undertones fills the entire house. Nothing beats tea sourced directly from the estate gardens! 🍵🍃 #AssamTea #ChaiTime #TeaLovers',
      imageUrl: '',
      hoursAgo: 200
    },
    {
      userIndex: 7, // Tanvi - Mumbai
      content: 'Taking the ferry from Gateway of India to Mandwa! Watching sea gulls glide alongside while the iconic Taj Mahal Palace hotel recedes in the background. Coastal Maharashtra weekends are underrated. 🚢🌊 #GatewayOfIndia #Alibaug #WeekendVibes',
      imageUrl: '',
      hoursAgo: 210
    },
    {
      userIndex: 9, // Devika - Bengaluru
      content: 'Cubbon Park on Sunday morning: runners, dog meetups, book clubs, guitarists strumming under giant rain trees, and zero honking. It is the green heart that keeps this buzzing tech city sane! 🌳🐕🎶 #CubbonPark #BengaluruDiaries #GreenCity',
      imageUrl: '',
      hoursAgo: 220
    },
    {
      userIndex: 4, // Harpreet - Ludhiana
      content: 'Golden Temple in Amritsar at Amrit Vela (dawn). The kirtan echoing across the sarovar, the marble cool under bare feet, and the langar where kings and commoners sit side-by-side on the floor as equals. Truly inspiring. 🕊️✨ #Amritsar #GoldenTemple #Seva',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      hoursAgo: 230
    }
  ];

  const insertPost = db.prepare(`
    INSERT INTO posts (user_id, content, image_url, created_at)
    VALUES (?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  postsData.forEach(p => {
    insertPost.run(userIds[p.userIndex], p.content, p.imageUrl || null, p.hoursAgo);
  });

  const allPosts = db.prepare('SELECT id FROM posts ORDER BY id ASC').all();
  const postIds: number[] = allPosts.map((p: any) => p.id);

  console.log(`Inserted and fetched ${postIds.length} posts.`);

  // Threaded comments on posts
  const commentsData = [
    {
      postIndex: 0,
      userIndex: 0, // Aarav
      content: 'Ekdum sach baat Tanvi! Mumbai ki baarish aur Dadar ki cutting chai ka koi tod nahi hai. Delhi me to sirf waterlogging hoti hai 😂',
      hoursAgo: 1,
      children: [
        {
          userIndex: 7, // Tanvi
          content: '@aarav_sharma Haha! Waterlogging Mumbai me bhi hoti hai Aarav, par spirit alag hai!',
          hoursAgo: 1
        }
      ]
    },
    {
      postIndex: 1,
      userIndex: 4, // Harpreet
      content: 'Chak de phatte! King Kohli is always reliable under pressure! 🏏🔥',
      hoursAgo: 4,
      children: [
        {
          userIndex: 6, // Imran
          content: '@harpreet_pb Absolutely Harpreet bhai, when Kohli is on crease, impossible is nothing!',
          hoursAgo: 3
        }
      ]
    },
    {
      postIndex: 2,
      userIndex: 2, // Rohan
      content: 'CTR benne dosa is supreme! Please tell me you took the filter coffee double strong?',
      hoursAgo: 7,
      children: [
        {
          userIndex: 9, // Devika
          content: '@rohan_pune Always! With extra foam and that stainless steel dabarah tumbler ☕',
          hoursAgo: 6
        }
      ]
    },
    {
      postIndex: 3,
      userIndex: 0, // Aarav
      content: 'Kabir bhai, agle mahine Lucknow aa raha hu. Aapka guide banne ka vaada pakka samjhu? 😋',
      hoursAgo: 10,
      children: [
        {
          userIndex: 10, // Kabir
          content: '@aarav_sharma Bilkul Aarav bhai! Chaupal ke doston ke liye dastarkhwan hamesha khula hai!',
          hoursAgo: 9
        }
      ]
    },
    {
      postIndex: 5,
      userIndex: 5, // Lakshmi
      content: 'Filter kaapi in the morning is not just a beverage Priya, it is a spiritual ceremony! Pure bliss. 🥥',
      hoursAgo: 18,
      children: []
    },
    {
      postIndex: 7,
      userIndex: 3, // Ananya
      content: 'Did you also stop by Indian Coffee House on College Street? The mutton cutlet and cold coffee with adda sessions are unbeatable!',
      hoursAgo: 28,
      children: []
    },
    {
      postIndex: 11,
      userIndex: 8, // Vikram
      content: 'Navratri vibes in Gujarat are truly on another level Meera ji! Jaipur me bhi garba clubs hote hain par Ahmedabad jaisi energy kahin nahi. 💃',
      hoursAgo: 50,
      children: []
    },
    {
      postIndex: 14,
      userIndex: 2, // Rohan
      content: 'Hahaha! Every engineer\'s superpower: 1 semester syllabus in 4 hours flat! 😂🙌',
      hoursAgo: 72,
      children: []
    }
  ];

  const insertComment = db.prepare(`
    INSERT INTO comments (post_id, user_id, parent_id, content, created_at)
    VALUES (?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  commentsData.forEach(c => {
    const parentRes = insertComment.run(
      postIds[c.postIndex],
      userIds[c.userIndex],
      null,
      c.content,
      c.hoursAgo
    );
    const parentId = parentRes.lastInsertRowid;

    if (c.children && c.children.length > 0) {
      c.children.forEach(child => {
        insertComment.run(
          postIds[c.postIndex],
          userIds[child.userIndex],
          parentId,
          child.content,
          child.hoursAgo
        );
      });
    }
  });

  // Seed likes
  const insertLike = db.prepare(`
    INSERT OR IGNORE INTO likes (post_id, user_id, created_at)
    VALUES (?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  // Distribute likes across posts
  postIds.forEach((postId, pIdx) => {
    // Each post gets between 3 and 10 likes from users
    const likeCount = (pIdx % 7) + 3;
    for (let i = 0; i < likeCount; i++) {
      const uId = userIds[(pIdx + i) % userIds.length];
      insertLike.run(postId, uId, (pIdx + 1) * 2);
    }
  });

  // Seed follows
  const insertFollow = db.prepare(`
    INSERT OR IGNORE INTO followers (follower_id, following_id, created_at)
    VALUES (?, ?, datetime('now', '-' || ? || ' days'))
  `);

  // Everyone follows 3-6 other people
  userIds.forEach((uId, idx) => {
    for (let f = 1; f <= 5; f++) {
      const targetId = userIds[(idx + f) % userIds.length];
      if (uId !== targetId) {
        insertFollow.run(uId, targetId, f * 5);
      }
    }
  });

  console.log('Chaupal database seeded successfully!');
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seed().then(() => {
    console.log('Seed execution completed.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
