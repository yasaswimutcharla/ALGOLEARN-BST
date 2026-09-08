import { TOPICS_BASICS } from './topicsBasics';
import { TOPICS_OPERATIONS } from './topicsOperations';
import { TOPICS_TRAVERSALS } from './topicsTraversals';
import { TopicAnimationData } from './types';

export const ALL_TOPIC_ANIMATIONS: Record<number, TopicAnimationData> = {
  ...TOPICS_BASICS,
  ...TOPICS_OPERATIONS,
  ...TOPICS_TRAVERSALS,
};

export function getTopicAnimation(topicNumber: number): TopicAnimationData {
  if (ALL_TOPIC_ANIMATIONS[topicNumber]) {
    return ALL_TOPIC_ANIMATIONS[topicNumber];
  }
  // Fallback to topic 1 if out of range
  return ALL_TOPIC_ANIMATIONS[1] || TOPICS_BASICS[1];
}
