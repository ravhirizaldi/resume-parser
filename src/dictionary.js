var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

module.exports = {
  titles: {
    objective: [
      'objective',
      'objectives',
      'objektif',
      'tujuan',
      'tujuan kerja',
    ],
    summary: ['summary', 'ringkasan', 'profil', 'profil singkat'],
    technology: [
      'technology',
      'technologies',
      'teknologi',
      'teknologi yang dikuasai',
    ],
    experience: [
      'experience',
      'work experience',
      'pengalaman kerja',
      'pengalaman',
      'work history',
      'riwayat kerja',
      'riwayat pekerjaan',
      'pengalaman kerja terakhir',
      'professional experience',
    ],
    education: ['education', 'pendidikan', 'riwayat pendidikan'],
    skills: [
      'skills',
      'Skills & Expertise',
      'technology',
      'technologies',
      'kemahiran',
      'kemahiran teknikal',
      'kemampuan',
      'kemampuan teknikal',
      'keahlian',
      'keahlian teknikal',
      'strengths',
      'skills and strengths',
      'kekuatan',
      'kekuatan dan keahlian',
    ],
    languages: ['languages', 'bahasa', 'bahasa yang dikuasai'],
    courses: [
      'courses',
      'pelatihan',
      'pelatihan yang diikuti',
      'kursus',
      'kursus yang diikuti',
    ],
    projects: [
      'projects',
      'project',
      'proyek',
      'proyek yang pernah dikerjakan',
    ],
    links: ['links', 'link', 'tautan', 'tautan'],
    contacts: ['contacts', 'contact', 'kontak', 'kontak yang bisa dihubungi'],
    positions: [
      'positions',
      'position',
      'posisi',
      'posisi yang pernah dipegang',
    ],
    profiles: [
      'profiles',
      'social connect',
      'social-profiles',
      'social profiles',
      'social media',
      'social-media',
      'profil sosial',
      'profil media sosial',
      'profil',
    ],
    awards: [
      'awards',
      'penghargaan',
      'prestasi',
      'achievement',
      'accomplishments',
      'penghargaan dan prestasi',
      'profesional awards',
      'profesional achievements',
      'profesional accomplishments',
    ],
    honors: ['honors', 'tanda kehormatan', 'kehormatan'],
    additional: [
      'additional',
      'additional information',
      'informasi tambahan',
      'other',
      'lainnya',
      'others',
    ],
    certification: [
      'certification',
      'certifications',
      'sertifikasi',
      'sertifikat',
    ],
    interests: ['interests', 'hobbies', 'hobi', 'minat'],
  },
  profiles: [
    [
      'github.com',
      function(url, Resume, profilesWatcher) {
        //if not contain http or https add https
        const regex = /^(http|https):\/\//;
        if (!regex.test(url)) {
          url = 'https://' + url;
        }

        download(url, function(data, err) {
          if (data) {
            var $ = cheerio.load(data),
              fullName = $('.vcard-fullname').text(),
              location = $('.octicon-location')
                .parent()
                .text(),
              mail = $('.octicon-mail')
                .parent()
                .text(),
              link = $('.octicon-link')
                .parent()
                .text(),
              clock = $('.octicon-clock')
                .parent()
                .text(),
              company = $('.octicon-organization')
                .parent()
                .text();

            Resume.addObject('github', {
              name: fullName,
              location: location,
              email: mail,
              link: link,
              joined: clock,
              company: company,
            });
          } else {
            return console.log(err);
          }
          //profilesInProgress--;
          profilesWatcher.inProgress--;
        });
      },
    ],
    [
      'linkedin.com',
      function(url, Resume, profilesWatcher) {
        download(url, function(data, err) {
          if (data) {
            var $ = cheerio.load(data),
              linkedData = {
                positions: {
                  past: [],
                  current: {},
                },
                languages: [],
                skills: [],
                educations: [],
                volunteering: [],
                volunteeringOpportunities: [],
              },
              $pastPositions = $('.past-position'),
              $currentPosition = $('.current-position'),
              $languages = $('#languages-view .section-item > h4 > span'),
              $skills = $(
                '.skills-section .skill-pill .endorse-item-name-text'
              ),
              $educations = $('.education'),
              $volunteeringListing = $('ul.volunteering-listing > li'),
              $volunteeringOpportunities = $(
                'ul.volunteering-opportunities > li'
              );

            linkedData.summary = $('#summary-item .summary').text();
            linkedData.name = $('.full-name').text();
            // current position
            linkedData.positions.current = {
              title: $currentPosition.find('header > h4').text(),
              company: $currentPosition.find('header > h5').text(),
              description: $currentPosition.find('p.description').text(),
              period: $currentPosition.find('.experience-date-locale').text(),
            };
            // past positions
            _.forEach($pastPositions, function(pastPosition) {
              var $pastPosition = $(pastPosition);
              linkedData.positions.past.push({
                title: $pastPosition.find('header > h4').text(),
                company: $pastPosition.find('header > h5').text(),
                description: $pastPosition.find('p.description').text(),
                period: $pastPosition.find('.experience-date-locale').text(),
              });
            });
            _.forEach($languages, function(language) {
              linkedData.languages.push($(language).text());
            });
            _.forEach($skills, function(skill) {
              linkedData.skills.push($(skill).text());
            });
            _.forEach($educations, function(education) {
              var $education = $(education);
              linkedData.educations.push({
                title: $education.find('header > h4').text(),
                major: $education.find('header > h5').text(),
                date: $education.find('.education-date').text(),
              });
            });
            _.forEach($volunteeringListing, function(volunteering) {
              linkedData.volunteering.push($(volunteering).text());
            });
            _.forEach($volunteeringOpportunities, function(volunteering) {
              linkedData.volunteeringOpportunities.push($(volunteering).text());
            });

            Resume.addObject('linkedin', linkedData);
          } else {
            return console.log(err);
          }
          profilesWatcher.inProgress--;
        });
      },
    ],
    'facebook.com',
    'bitbucket.org',
    'stackoverflow.com',
  ],
  inline: {
    //address: 'address',
    skype: 'skype',
  },
  regular: {
    name: [
      /^[A-Z][a-z]*\s[A-Z]\.[A-Za-z]*|^[A-Z][a-z]*\s[A-Z][a-z]*|^[A-Z]+\s[A-Z]+[a-z]*|^[A-Z][a-z]*\s[A-Z][a-z]*\s[A-Z][a-z]*/,
    ],
    email: [/([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})/],
    phone: [
      /((?:\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4})|((?:\(\+\d{2,3}\)|\+?\d{2,3})\s?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4})/,
    ],
    address: [
      /^[A-Z][a-z\s,]+(?:,\s[A-Za-z\s]+)*?(?=\b[A-Za-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b|$)/,
    ],
  },
};

// helper method
function download(url, callback) {
  //if url not contain http or https add https
  const regex = /^(http|https):\/\//;
  if (!regex.test(url)) {
    url = 'https://' + url;
  }

  const headers = {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, sdch, br',
    'accept-language': 'en-US,en;q=0.8,ms;q=0.6',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
  };

  request({ url, headers }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body);
    } else {
      callback(null, error);
    }
  });
}
