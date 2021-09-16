import SocMedService from "./services/SocMedService";
import Instagram from "./instagram/Instagram";
import { ioInput } from "./libs/utils";
import Likes from "./models/Likes";
import Comments from "./models/Comments";
import ProgressBar from 'progress';
import ora from 'ora';

export default async function controller(browserInstance: Promise<any>) {
  const browser = await browserInstance;

  const ig = new Instagram({
    browser,
    is2faEnabled: false,
    tenantName: 'my-giveaway'
  });
  const session = new SocMedService(ig);
  await session.boot();

  const postShortcode = await ioInput('Input the post shortcode => ', true);
  const validTaggedPeople = await ioInput('Number of valid tagged people => ', true);
  const numberOfWinner = Number(await ioInput('Number of respected winner => ', true));
  const bar = new ProgressBar('scraping :bar', { total: 3 });

  const spinner = ora();
  spinner.spinner = 'bouncingBar';
  spinner.start();

  spinner.text = 'Collecting likes.';
  const likesDB = new Likes({
    dbName: 'instagram.com'
  });
  const likes = await session.getPostLikes(postShortcode);
  const allLikes = likes.reduce((prev, next) => prev.concat(next.data), []) as any[];
  await likesDB.saveLikes(postShortcode, likes);

  bar.tick();

  if (!allLikes.length) {
    bar.interrupt('Opps! No likes! We can\'t decide it yet.');
    return process.exit();
  }

  spinner.text = 'Collecting comments';
  const commentsDB = new Comments({
    dbName: 'instagram.com'
  });
  const comments = await session.getPostComments(postShortcode);
  const allComments = comments.reduce((prev, next) => prev.concat(next.data), []) as any[];
  await commentsDB.saveComments(postShortcode, comments);
  bar.tick();

  if (!allComments.length) {
    bar.interrupt('Opps! No comments! We can\'t decide it yet.');
    return process.exit();
  }

  // get the comments text
  spinner.text = 'Filtering user with valid number of tags.';
  const onlyValidComments = allComments.filter((comment) => commentsDB.countTaggedPeople(comment.text, Number(validTaggedPeople)));
  bar.tick();

  if (!onlyValidComments.length) {
    bar.interrupt('Oops! Seems like we haven\'t found the winner yet.');
    return process.exit();
  }

  const validUserWithCommentLike = onlyValidComments.filter((comment) => allLikes.some((like) => like.username === comment.owner.username));

  if (!validUserWithCommentLike.length) {
    bar.interrupt('Oops! Seems no one is followed the rules.');
    return process.exit();
  }

  spinner.text = `Selecting the ${numberOfWinner} of respected winner! The candidates: ${validUserWithCommentLike.map((user) => user.owner.username).join(', ')}`;
  bar.tick();

  const theWinners = [];
  if (validUserWithCommentLike.length < numberOfWinner) {
    for (let i = 0; i < numberOfWinner; i++) {
      const winner = validUserWithCommentLike[Math.floor(Math.random() * validUserWithCommentLike.length)];
      theWinners.push(winner);
    }
  } else {
    theWinners.push(...validUserWithCommentLike);
  }

  spinner.text = `The winner is: ${theWinners.map((winner) => winner.owner.username).join(', ')}`;

  bar.tick();
  spinner.stop();
  process.exit();
}