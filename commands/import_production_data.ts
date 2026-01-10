import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import Section from '#models/section'
import Setting from '#models/setting'

export default class ImportProductionData extends BaseCommand {
  static commandName = 'import:production-data'
  static description = 'Import production content data'
  static options: CommandOptions = { startApp: true }

  async run() {
    this.logger.info('Starting production data import...')

    // Clear existing sections
    await Section.query().delete()
    this.logger.info('Cleared existing sections')

    // Import sections
    const sections = [
      {
        id: 1,
        title: 'Jude',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude is one of the shortest books in the Bible and almost at the end - the second last one. The writer of this book expects that by sharing about this one - you will be encouraged to look at what the other books all say. In fact, the whole Bible is like breadcrumbs leading us into an understanding of God&hellip;</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude's letter to the early church is a call to protect the faith and build ourselves up in love. Jude (half-brother of Jesus) reminds the early Christians of God's faithful love. God reaches out to save us from evil, all the while working with mercy, love, and compassion. While some people may have rejected God, God never rejects us. Jude points to the warning signs of falling away from faith and contrasts those experiences with the power of remaining in Christ. Whoever we are and whatever we have done &ndash; God is able to keep us and present us without fault in His presence with great joy!</span></p>`,
        reflectiveQuestion: 'RQ: Do you read the summary on the back of a book before buying it?',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 0,
        isPublished: true,
      },
      {
        id: 2,
        title: 'Jude, a servant of Jesus Christ and brother of James (Jude 1a)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude literally means "Judah" or "praised." This Jewish name was common. According to Matthew (13:55) and Mark (6:3), Jesus had four brothers: James, Joses (Joseph), Simon, and Judas (Jude). These were half-brothers born to Joseph and Mary.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude humbly calls himself a servant of Christ rather than claiming the title "brother of Jesus." This shows maturity and reverence. Like James, Jude acknowledges Jesus as Lord. Our closest family members often know us best and can see both our virtues and our flaws. That Jude calls Jesus "Lord" and himself a "servant" shows a deep faith developed through witnessing Jesus' life, death, and resurrection.</span></p>`,
        reflectiveQuestion: 'RQ: What are some ways that your siblings know you that others can\'t?',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 1,
        isPublished: true,
      },
      {
        id: 3,
        title: 'To those who are called, loved by God the Father, and kept by Jesus Christ (Jude 1b)',
        content: `<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">Jude is writing to believers - those who are called, loved, and kept. This is a beautiful description of every Christian. We are called by God, loved by the Father, and kept (protected, preserved) by Jesus Christ.</span></p>
<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">The word "called" suggests divine initiative. God calls us to Himself. The word "loved" shows God's affection for His children. The word "kept" means to guard or protect. Jesus keeps us secure in our faith.</span></p>`,
        reflectiveQuestion: 'RQ: What are some times in your life you hoped your name would be called out? How does that experience compare to God calling your name and welcoming you into His family?"',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 2,
        isPublished: true,
      },
      {
        id: 4,
        title: '"May mercy, peace, and love be yours in abundance."',
        content: `<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">This is Jude's greeting and blessing to his readers. He desires three things for them: mercy, peace, and love - and not just a little, but in abundance!</span></p>
<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">Mercy is God's compassion shown to those in need. Peace is the wholeness and harmony that comes from being right with God. Love is the self-giving care that God shows to us and that we are called to show to others.</span></p>`,
        reflectiveQuestion: 'RQ: What situation in your life has been the closest to you experiencing abundant mercy, peace and love?"',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 3,
        isPublished: true,
      },
      {
        id: 5,
        title: 'Dear friends, although I was eager to write to you about the salvation we share…(Jude 2)',
        content: `<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">Jude had intended to write a different letter - one about the wonderful salvation all believers share. But circumstances changed his plans. He felt compelled to write urgently about defending the faith instead.</span></p>
<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">This shows that even in the early church, false teachings were a serious threat. Jude saw the danger and responded quickly with this letter of warning and encouragement.</span></p>`,
        reflectiveQuestion: null,
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 4,
        isPublished: true,
      },
      {
        id: 8,
        title: '"I found it necessary to write and urge you to contend for the faith that was once for all delivered to the saints. For certain men have slipped in unnoticed, ungodly people who distort the grace of our God into license for sin and deny our only Master and Lord, Jesus Christ." (Jude 3–4)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude urges believers to "contend for the faith." This means to fight earnestly for the truth of the gospel. The faith was "once for all delivered" - meaning it is complete and unchangeable.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">False teachers had infiltrated the church. They were twisting God's grace into an excuse for immoral behavior. They denied Jesus Christ as Lord. Jude warns that these people face certain judgment.</span></p>`,
        reflectiveQuestion: 'RQ: Have you ever stood up on behalf of someone else?',
        reflectiveQuestion2: 'RQ: Have you ever tried to prevent someone from making a choice that could harm them or those they love?',
        reflectiveQuestion3: null,
        displayOrder: 5,
        isPublished: true,
      },
      {
        id: 7,
        title: '"I want to remind you, though you already know all this: the Lord once rescued His people from Egypt, but later destroyed those who did not believe. And the angels who did not keep their proper positions but abandoned their dwelling - He has kept in eternal chains, awaiting judgment on the great day. In the same way, Sodom and Gomorrah and the surrounding cities, which gave themselves to immorality and perversion, serve as examples of those who suffer the punishment of eternal fire." (Jude 5–7)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude gives three examples from history as warnings: (1) the Israelites who were delivered from Egypt but later rebelled and died in the wilderness; (2) the angels who left their proper place and are now awaiting judgment; (3) Sodom and Gomorrah, destroyed for their sexual immorality.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">These examples show that God's judgment is real and certain for those who rebel against Him.</span></p>`,
        reflectiveQuestion: 'RQ: Have you ever made a decision – against your better judgement?',
        reflectiveQuestion2: 'RQ: When is this okay and when can it be self-destructive?',
        reflectiveQuestion3: null,
        displayOrder: 6,
        isPublished: true,
      },
      {
        id: 9,
        title: '8 Nevertheless, these dreamers likewise defile their flesh, reject authority, and blaspheme glorious ones. 9 Yet Michael the archangel, when he was disputing with the Devil in a debate about Moses\' body, did not dare bring an abusive condemnation against him but said, "The Lord rebuke you!" 10 But these people blaspheme anything they don\'t understand. What they know by instinct like unreasoning animals - they destroy themselves with these things. 11 Woe to them! For they have travelled in the way of Cain, have abandoned themselves to the error of Balaam for profit, and have perished in Korah\'s rebellion. (Jude 8–11)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude describes the false teachers as "dreamers" who defile themselves, reject authority, and slander spiritual beings. Even the archangel Michael showed restraint when dealing with the devil, saying only "The Lord rebuke you!"</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">These false teachers follow the way of Cain (jealousy and murder), the error of Balaam (greed), and the rebellion of Korah (pride and insubordination). Their end will be destruction.</span></p>`,
        reflectiveQuestion: 'RQ: What are examples of self-inflicted loss or pain?',
        reflectiveQuestion2: 'RQ: What are some ways overconfidence gets people into trouble?',
        reflectiveQuestion3: 'RQ: What are some things that people often despise and reject despite them being quite good for them?',
        displayOrder: 7,
        isPublished: true,
      },
      {
        id: 10,
        title: '"These people are hidden reefs at your love feasts. They feast with you without fear, caring only for themselves. They are waterless clouds carried by the wind; autumn trees without fruit, twice dead and uprooted; wild waves of the sea, foaming up their shame; wandering stars for whom the darkness of eternity is reserved." (Jude 12–13)',
        content: `<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">Jude uses vivid word pictures to describe the false teachers: hidden reefs (dangerous and destructive), waterless clouds (promise but don't deliver), autumn trees without fruit (barren and dead), wild waves (uncontrolled and shameful), wandering stars (lost and destined for darkness).</span></p>
<p><span style="font-size: 11.0pt; line-height: 115%; font-family: 'Arial',sans-serif;">These people care only for themselves and bring destruction to others.</span></p>`,
        reflectiveQuestion: 'RQ: Have you ever been conned?',
        reflectiveQuestion2: 'RQ: What does it feel like to be tricked and then hurt?',
        reflectiveQuestion3: null,
        displayOrder: 8,
        isPublished: true,
      },
      {
        id: 11,
        title: '"And Enoch, in the seventh generation from Adam, prophesied about them: \'Look! The Lord comes with thousands of His holy ones to execute judgment on all and to convict them of all their ungodly acts that they have done in an ungodly way, and of all the harsh things ungodly sinners have said against Him.\'" (Jude 14–15)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude quotes from the ancient book of Enoch to show that judgment has been prophesied from the very beginning. The Lord will come with His holy ones to judge the ungodly for their actions and their words against Him.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">This is both a warning and a comfort - a warning to those who reject God, and a comfort to those who trust Him.</span></p>`,
        reflectiveQuestion: 'RQ: Thinking back over history what are some ways that people have lived as though God did not exist?',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 9,
        isPublished: true,
      },
      {
        id: 12,
        title: '"These people are discontented grumblers, following their own desires; their mouths speak arrogant words, flattering others for personal gain." (Jude 16)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">The false teachers are characterized by grumbling, following their own desires, arrogant speech, and flattery for personal gain. They are self-centered and manipulative.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">In contrast, true believers are called to be content, humble, and genuine in their relationships.</span></p>`,
        reflectiveQuestion: 'RQ: Have you ever met someone that constantly grumbles or endlessly flatters? How did you feel?',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 10,
        isPublished: true,
      },
      {
        id: 13,
        title: '"But you, dear friends, remember what the apostles of our Lord Jesus Christ predicted: that in the last times there would be scoffers, following their own ungodly desires. These people create divisions and are unbelievers, not having the Spirit." (Jude 17–19)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude reminds believers that the apostles warned about scoffers in the last days. These people follow their own desires, create divisions in the church, and do not have the Holy Spirit.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">True believers, in contrast, are united in the Spirit and pursue God's desires rather than their own.</span></p>`,
        reflectiveQuestion: 'RQ: List some reasons that people don\'t take God seriously?',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 11,
        isPublished: true,
      },
      {
        id: 14,
        title: '"But you, dear friends, build yourselves up in your most holy faith and pray in the Holy Spirit. Keep yourselves in the love of God, looking forward to the mercy of our Lord Jesus Christ that leads to eternal life. Show mercy to those who doubt. Save others by rescuing them from the fire. Have mercy, but with discernment, hating even the defiled garments of the flesh." (Jude 20–23)',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">After all the warnings, Jude now gives positive instructions: build yourselves up in faith, pray in the Spirit, keep yourselves in God's love, and look forward to Christ's mercy.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">He also instructs believers to show mercy to those who doubt, to rescue others from destruction, and to be discerning - hating sin while loving the sinner.</span></p>`,
        reflectiveQuestion: 'RQ: why is rescuing someone intrinsically dangerous?',
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 12,
        isPublished: true,
      },
      {
        id: 15,
        title: '24 Now to Him who is able to protect you from stumbling and to make you stand in the presence of His glory, blameless and with great joy, 25 to the only God our Savior, through Jesus Christ our Lord, be glory, majesty, power, and authority before all time, now and forever. Amen.',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span class="Heading2Char"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude ends with one of the most beautiful benedictions in the Bible. God is able to keep us from falling and to present us faultless before His glory with exceeding joy!</span></span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">To God alone - our Savior through Jesus Christ - belongs all glory, majesty, power, and authority for all eternity. Amen!</span></p>`,
        reflectiveQuestion: 'RQ: What is the closest you have come to danger/disaster?',
        reflectiveQuestion2: 'RQ: What are some ways that God could make you spiritually stronger?',
        reflectiveQuestion3: 'RQ: What name is mentioned the most in this book of the Bible?',
        displayOrder: 13,
        isPublished: true,
      },
      {
        id: 16,
        title: 'Jude is a bit like reading the back of a book to know what it is about.',
        content: `<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">Jude serves as a powerful summary of the entire Bible's message. Like reading the back cover of a book, it gives us the key themes: God's love for His people, the reality of judgment for those who reject Him, and the hope of eternal life through Jesus Christ.</span></p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">&nbsp;</p>
<p class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><span style="font-size: 11.0pt; font-family: 'Arial',sans-serif;">May this study encourage you to explore the rest of God's Word and grow in your faith!</span></p>`,
        reflectiveQuestion: null,
        reflectiveQuestion2: null,
        reflectiveQuestion3: null,
        displayOrder: 14,
        isPublished: true,
      },
    ]

    for (const section of sections) {
      await Section.create({
        title: section.title,
        content: section.content,
        reflectiveQuestion: section.reflectiveQuestion,
        reflectiveQuestion2: section.reflectiveQuestion2,
        reflectiveQuestion3: section.reflectiveQuestion3,
        displayOrder: section.displayOrder,
        isPublished: section.isPublished,
      })
    }
    this.logger.info(`Imported ${sections.length} sections`)

    // Import settings
    await Setting.set('welcome_title', "Miriam's Hope")
    await Setting.set('lesson_title', 'Jude')
    await Setting.set('lesson_introduction', '')
    await Setting.set('welcome_subtitle', `<h2 class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;"><strong><span style="font-family: 'Arial',sans-serif;">"ALKITAB: TERJEMAHAN SEDERHANA INDONESIA</span></strong></h2>
<h3 class="MsoNormal" style="margin-bottom: 0cm; line-height: normal;">Keladian. Ulangan. Perjanjian Baru"</h3>
<h3>Introducing God&rsquo;s Word Devotional Expository<br>Evangelistic Bible Study</h3>`)
    this.logger.info('Imported settings')

    this.logger.success('Production data import completed successfully!')
  }
}