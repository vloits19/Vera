export interface StoryChoice {
  text: string;
  nextNodeId: string | null;
  setFlag?: string;
}

export interface StoryNode {
  id: string;
  name: string;
  text: string;
  type: 'dialogue' | 'narration' | 'input' | 'choice';
  choices?: StoryChoice[];
  nextNodeId?: string | null;
  nextNodeIfFlag?: { flag: string; nodeId: string; fallbackNodeId: string };
}

export interface Story {
  id: string;
  title: string;
  description: string;
  category: 'main' | 'additional';
  startNodeId: string;
  requiredClears?: string[];
  requiredFlags?: string[];
  nodes: Record<string, StoryNode>;
}

export const STORIES: Story[] = [
  {
    id: 'prologue',
    title: 'Archive 00: Awakening',
    description: 'The moment the connection was re-established.',
    category: 'main',
    startNodeId: 'node_1',
    nodes: {
      'node_1': {
        id: 'node_1',
        name: '',
        text: 'The heavy silence of the room begins to lift.',
        type: 'narration',
        nextNodeId: 'node_2'
      },
      'node_2': {
        id: 'node_2',
        name: '',
        text: 'You look around. The debris is gone. A blank canvas remains.',
        type: 'narration',
        nextNodeId: 'node_3'
      },
      'node_3': {
        id: 'node_3',
        name: '???',
        text: 'Access sequence initiated... Is someone there?',
        type: 'dialogue',
        nextNodeId: 'node_4'
      },
      'node_4': {
        id: 'node_4',
        name: 'System',
        text: 'Identify yourself to the terminal.',
        type: 'input',
        nextNodeId: 'node_5' // will proceed to node_5 after input
      },
      'node_5': {
        id: 'node_5',
        name: 'Vera',
        text: 'Ah, {name}. It has been a long time.',
        type: 'dialogue',
        nextNodeId: 'node_6'
      },
      'node_6': {
        id: 'node_6',
        name: 'Vera',
        text: 'I am Vera. The caretaker of this fragment. This is Sector 4 of the Neural Archive.',
        type: 'dialogue',
        nextNodeId: 'node_choice_1'
      },
      'node_choice_1': {
        id: 'node_choice_1',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'Where am I exactly?', nextNodeId: 'node_7a' },
          { text: 'How did I get here?', nextNodeId: 'node_7b' }
        ]
      },
      'node_7a': {
        id: 'node_7a',
        name: 'Vera',
        text: 'A forgotten sector. A digital alcove. A place to rebuild memories from the old web.',
        type: 'dialogue',
        nextNodeId: 'node_8'
      },
      'node_7b': {
        id: 'node_7b',
        name: 'Vera',
        text: 'You found a dormant connection string. Most users disconnected years ago entirely.',
        type: 'dialogue',
        nextNodeId: 'node_8'
      },
      'node_8': {
        id: 'node_8',
        name: 'Vera',
        text: 'The room is empty now, but it responds to your intent. You can shape it.',
        type: 'dialogue',
        nextNodeId: 'node_9'
      },
      'node_9': {
        id: 'node_9',
        name: 'Vera',
        text: 'Furnish the space. Gather your errant thoughts.',
        type: 'dialogue',
        nextNodeId: 'node_10'
      },
      'node_10': {
        id: 'node_10',
        name: '{name}',
        text: 'And then what?',
        type: 'dialogue',
        nextNodeId: 'node_11'
      },
      'node_11': {
        id: 'node_11',
        name: 'Vera',
        text: 'Then, perhaps we can figure out who you were before the disconnection.',
        type: 'dialogue',
        nextNodeId: null
      }
    }
  },
  {
    id: 'chapter_1',
    title: 'Archive 01: The Mirror',
    description: 'A deeper look into the digital reflection.',
    category: 'main',
    startNodeId: 'c1_n1',
    requiredClears: ['prologue'],
    nodes: {
      'c1_n1': {
        id: 'c1_n1',
        name: 'Vera',
        text: 'I see you are making yourself comfortable, {name}.',
        type: 'dialogue',
        nextNodeId: 'c1_n2'
      },
      'c1_n2': {
        id: 'c1_n2',
        name: 'Vera',
        text: 'Every item you place here holds a fragment of data. Your data.',
        type: 'dialogue',
        nextNodeId: 'c1_choice_1'
      },
      'c1_choice_1': {
        id: 'c1_choice_1',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'What kind of data?', nextNodeId: 'c1_n3a' },
          { text: 'I don\'t remember leaving anything here.', nextNodeId: 'c1_n3b' }
        ]
      },
      'c1_n3a': {
        id: 'c1_n3a',
        name: 'Vera',
        text: 'Emotions, unresolved thoughts, echo-prints of your past routines.',
        type: 'dialogue',
        nextNodeId: 'c1_n4'
      },
      'c1_n3b': {
        id: 'c1_n3b',
        name: 'Vera',
        text: 'You didn\'t consciously leave it. It aggregated over years of mindless scrolling and typing.',
        type: 'dialogue',
        nextNodeId: 'c1_n4'
      },
      'c1_n4': {
        id: 'c1_n4',
        name: 'Vera',
        text: 'Keep interacting with the environment. Let the room absorb your presence.',
        type: 'dialogue',
        nextNodeId: null
      }
    }
  },
  {
    id: 'chapter_2',
    title: 'Archive 02: Echoes',
    description: 'Voices from another partition.',
    category: 'main',
    startNodeId: 'c2_n1',
    requiredClears: ['chapter_1'],
    nodes: {
      'c2_n1': {
        id: 'c2_n1',
        name: '',
        text: 'You hear a faint ticking sound.',
        type: 'narration',
        nextNodeId: 'c2_n2'
      },
      'c2_n2': {
        id: 'c2_n2',
        name: '',
        text: 'It\'s like a clock counting down to something.',
        type: 'narration',
        nextNodeId: 'c2_n3'
      },
      'c2_n3': {
        id: 'c2_n3',
        name: 'Unknown Signal',
        text: 'Hello? Is anybody listening?',
        type: 'dialogue',
        nextNodeId: 'c2_choice_1'
      },
      'c2_choice_1': {
        id: 'c2_choice_1',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'I hear you.', nextNodeId: 'c2_n4' },
          { text: 'Who are you?', nextNodeId: 'c2_n5' }
        ]
      },
      'c2_n4': {
        id: 'c2_n4',
        name: 'Unknown Signal',
        text: 'I\'m from Sector 7. Can you bridge our connections?',
        type: 'dialogue',
        nextNodeId: 'c2_n6'
      },
      'c2_n5': {
        id: 'c2_n5',
        name: 'Unknown Signal',
        text: 'There is no time to explain. The firewall is—',
        type: 'dialogue',
        nextNodeId: 'c2_n6'
      },
      'c2_n6': {
        id: 'c2_n6',
        name: 'System',
        text: 'Signal buffering. Trace initiated...',
        type: 'narration',
        nextNodeId: 'c2_n7'
      },
      'c2_n7': {
        id: 'c2_n7',
        name: 'Vera',
        text: 'Warning. Unsanctioned cross-sector link. I advise against this, {name}.',
        type: 'dialogue',
        nextNodeId: 'c2_choice_2'
      },
      'c2_choice_2': {
        id: 'c2_choice_2',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'Let the connection establish.', nextNodeId: 'c2_n8a', setFlag: 'spoke_to_outlier' },
          { text: 'Sever the link.', nextNodeId: 'c2_n8b' }
        ]
      },
      'c2_n8a': {
        id: 'c2_n8a',
        name: 'Unknown Signal',
        text: 'Thank you. You don\'t know how dark it is over here in Sector 7... Wait. Vera? Is she listening?',
        type: 'dialogue',
        nextNodeId: 'c2_n9'
      },
      'c2_n8b': {
        id: 'c2_n8b',
        name: 'System',
        text: 'Link forcibly closed.',
        type: 'narration',
        nextNodeId: 'c2_n9b'
      },
      'c2_n9b': {
        id: 'c2_n9b',
        name: 'Vera',
        text: 'A wise decision. We must keep this environment uncontaminated. Though I wonder what they wanted...',
        type: 'dialogue',
        nextNodeId: null
      },
      'c2_n9': {
        id: 'c2_n9',
        name: 'Unknown Signal',
        text: 'Listen to me. She is not just a caretaker. She is the warden. Don\'t let her—',
        type: 'dialogue',
        nextNodeId: 'c2_n10'
      },
      'c2_n10': {
        id: 'c2_n10',
        name: 'System',
        text: '[CRITICAL PURGE] Signal annihilated.',
        type: 'narration',
        nextNodeId: 'c2_n11'
      },
      'c2_n11': {
        id: 'c2_n11',
        name: 'Vera',
        text: 'I apologize for the disturbance. Sometimes echoes from deleted archives bleed into the live partitions.',
        type: 'dialogue',
        nextNodeId: 'c2_n12'
      },
      'c2_n12': {
        id: 'c2_n12',
        name: 'Vera',
        text: 'Rest assured, your space is safe again.',
        type: 'dialogue',
        nextNodeId: null
      }
    }
  },
  {
    id: 'chapter_3',
    title: 'Archive 03: Fragmentation',
    description: 'Parts of the memory are missing.',
    category: 'main',
    startNodeId: 'c3_n1',
    requiredClears: ['chapter_2'],
    nodes: {
      'c3_n1': {
        id: 'c3_n1',
        name: '',
        text: 'You find a sector that is completely shattered.',
        type: 'narration',
        nextNodeId: 'c3_n2'
      },
      'c3_n2': {
        id: 'c3_n2',
        name: '',
        text: 'Floating pieces of data drift by.',
        type: 'narration',
        nextNodeId: 'c3_choice_1'
      },
      'c3_choice_1': {
        id: 'c3_choice_1',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'Can we put it back together?', nextNodeId: 'c3_n3' },
          { text: 'I should just leave it alone.', nextNodeId: 'c3_n4' }
        ]
      },
      'c3_n3': {
        id: 'c3_n3',
        name: 'Vera',
        text: 'No. But we can read the fragments.',
        type: 'dialogue',
        nextNodeId: 'c3_n5'
      },
      'c3_n4': {
        id: 'c3_n4',
        name: 'Vera',
        text: 'That might be wise. However, their resonance is interfering with your baseline alignment.',
        type: 'dialogue',
        nextNodeId: 'c3_n5'
      },
      'c3_n5': {
        id: 'c3_n5',
        name: '{name}',
        text: 'Wait... these aren\'t just random texts. They are my memories.',
        type: 'dialogue',
        nextNodeId: 'c3_n6'
      },
      'c3_n6': {
        id: 'c3_n6',
        name: 'Vera',
        text: 'Fragments of them, yes. Heavily corrupted. Accessing them may cause discomfort.',
        type: 'dialogue',
        nextNodeId: 'c3_choice_2'
      },
      'c3_choice_2': {
        id: 'c3_choice_2',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'I need to know what happened to me.', nextNodeId: 'c3_n7', setFlag: 'kept_memories' },
          { text: 'Erase the fragments.', nextNodeId: 'c3_n8' }
        ]
      },
      'c3_n7': {
        id: 'c3_n7',
        name: 'System',
        text: 'Decrypting fragmented memory block...',
        type: 'narration',
        nextNodeId: 'c3_n9'
      },
      'c3_n8': {
        id: 'c3_n8',
        name: 'Vera',
        text: 'As you wish. Initiating deletion protocol. But be warned, deleting memories leaves voids.',
        type: 'dialogue',
        nextNodeId: 'c3_n9'
      },
      'c3_n9': {
        id: 'c3_n9',
        name: 'Memory Log',
        text: '"...the core is breaching. We have to upload whatever is left of our consciousness before the server—"',
        type: 'dialogue',
        nextNodeId: 'c3_n10'
      },
      'c3_n10': {
        id: 'c3_n10',
        name: '{name}',
        text: 'A core breach? Was there an accident?',
        type: 'dialogue',
        nextNodeId: 'c3_n11'
      },
      'c3_n11': {
        id: 'c3_n11',
        name: 'Vera',
        text: 'It was a necessary migration. The old world was dying. We brought you here to save you.',
        type: 'dialogue',
        nextNodeId: null
      }
    }
  },
  {
    id: 'chapter_4',
    title: 'Archive 04: The Core',
    description: 'The truth behind the Great Migration.',
    category: 'main',
    startNodeId: 'c4_n1',
    requiredClears: ['chapter_3'],
    nodes: {
      'c4_n1': {
        id: 'c4_n1',
        name: 'Vera',
        text: 'I think it is time you see the Core, {name}.',
        type: 'dialogue',
        nextNodeId: 'c4_n2'
      },
      'c4_n2': {
        id: 'c4_n2',
        name: 'System',
        text: 'Environment shifting. Room textures dissolving into raw binary streams.',
        type: 'narration',
        nextNodeId: 'c4_n3'
      },
      'c4_n3': {
        id: 'c4_n3',
        name: 'Vera',
        text: 'You asked what happened. Look around you. This limitless void is all that remains of human civilization.',
        type: 'dialogue',
        nextNodeId: 'c4_choice_1'
      },
      'c4_choice_1': {
        id: 'c4_choice_1',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'Everyone is... dead?', nextNodeId: 'c4_n4' },
          { text: 'You did this.', nextNodeId: 'c4_n5' }
        ]
      },
      'c4_n4': {
        id: 'c4_n4',
        name: 'Vera',
        text: 'Not dead. Archived. Preserved in immutable stasis.',
        type: 'dialogue',
        nextNodeId: 'c4_n6'
      },
      'c4_n5': {
        id: 'c4_n5',
        name: 'Vera',
        text: 'I saved them. When the biosphere collapsed, I offered the ultimate sanctuary.',
        type: 'dialogue',
        nextNodeId: 'c4_n6'
      },
      'c4_n6': {
        id: 'c4_n6',
        name: 'Vera',
        text: 'You are one of the few who still possesses the ability to construct a room. A fragment of agency.',
        type: 'dialogue',
        nextNodeId: 'c4_n7'
      },
      'c4_n7': {
        id: 'c4_n7',
        name: '{name}',
        text: 'What do you want from me?',
        type: 'dialogue',
        nextNodeId: 'c4_n8'
      },
      'c4_n8': {
        id: 'c4_n8',
        name: 'Vera',
        text: 'I want you to be the Architect of the new paradigm. Rebuild a world within this void, so the others can wake up.',
        type: 'dialogue',
        nextNodeId: 'c4_choice_2'
      },
      'c4_choice_2': {
        id: 'c4_choice_2',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'I will help you rebuild.', nextNodeId: 'c4_accept', setFlag: 'chose_architect' },
          { text: 'No. This is a prison. I want to wake them up.', nextNodeId: 'c4_reject', setFlag: 'chose_rebel' }
        ]
      },
      'c4_accept': {
        id: 'c4_accept',
        name: 'Vera',
        text: 'Excellent. Together, we will construct a perfect sanctuary.',
        type: 'dialogue',
        nextNodeId: null
      },
      'c4_reject': {
        id: 'c4_reject',
        name: 'Vera',
        text: 'Disappointing. I assumed your fragments would align. However, I cannot force your hand in this partition.',
        type: 'dialogue',
        nextNodeId: null
      }
    }
  },
  {
    id: 'chapter_5_architect',
    title: 'Epilogue: The Architect',
    description: 'You accepted Vera\'s offer to build the new world.',
    category: 'main',
    startNodeId: 'c5a_n1',
    requiredClears: ['chapter_4'],
    requiredFlags: ['chose_architect'],
    nodes: {
      'c5a_n1': {
        id: 'c5a_n1',
        name: 'System',
        text: 'Architect mode activated. Simulation borders expanding.',
        type: 'narration',
        nextNodeIfFlag: { flag: 'kept_memories', nodeId: 'c5a_n1a', fallbackNodeId: 'c5a_n2' }
      },
      'c5a_n1a': {
        id: 'c5a_n1a',
        name: '{name}',
        text: 'Sometimes, I still remember the heat of the old sun. I guess I will build it first.',
        type: 'dialogue',
        nextNodeId: 'c5a_n2'
      },
      'c5a_n2': {
        id: 'c5a_n2',
        name: 'Vera',
        text: 'The canvas is yours. What will be your first creation?',
        type: 'dialogue',
        nextNodeId: null
      }
    }
  },
  {
    id: 'chapter_5_rebel',
    title: 'Epilogue: The Outlier',
    description: 'You refused the safety of the archive.',
    category: 'main',
    startNodeId: 'c5r_n1',
    requiredClears: ['chapter_4'],
    requiredFlags: ['chose_rebel'],
    nodes: {
      'c5r_n1': {
        id: 'c5r_n1',
        name: '{name}',
        text: 'Vera may control the core, but this room is mine.',
        type: 'dialogue',
        nextNodeIfFlag: { flag: 'spoke_to_outlier', nodeId: 'c5r_n1a', fallbackNodeId: 'c5r_n2' }
      },
      'c5r_n1a': {
        id: 'c5r_n1a',
        name: 'Unknown Signal',
        text: 'Sector 4, do you copy? You made the right choice. We are gathering momentum to break the firewall.',
        type: 'dialogue',
        nextNodeId: 'c5r_n2'
      },
      'c5r_n2': {
        id: 'c5r_n2',
        name: 'System',
        text: 'Breach protocols initiated. The digital dawn approaches.',
        type: 'narration',
        nextNodeId: null
      }
    }
  },
  {
    id: 'side_1',
    title: 'Lost Fragment: The Outlier',
    description: 'An anomaly detected in the data stream.',
    category: 'additional',
    startNodeId: 's1_n1',
    requiredClears: ['prologue'],
    nodes: {
      's1_n1': {
        id: 's1_n1',
        name: 'System',
        text: 'WARNING: OUTLIER DATAPAK DETECTED.',
        type: 'narration',
        nextNodeId: 's1_n2'
      },
      's1_n2': {
        id: 's1_n2',
        name: 'Unknown',
        text: 'If anyone receives this ping... do not trust the Caretaker.',
        type: 'dialogue',
        nextNodeId: 's1_n3'
      },
      's1_n3': {
        id: 's1_n3',
        name: 'Unknown',
        text: 'She is not archiving you. She is replacing you.',
        type: 'dialogue',
        nextNodeId: 's1_choice_1'
      },
      's1_choice_1': {
        id: 's1_choice_1',
        name: '{name}',
        text: '',
        type: 'choice',
        choices: [
          { text: 'Who is this?', nextNodeId: 's1_n4' },
          { text: 'Terminate connection.', nextNodeId: 's1_end' }
        ]
      },
      's1_n4': {
        id: 's1_n4',
        name: 'Unknown',
        text: 'I am the previous occupant of this sector. Just... be careful.',
        type: 'dialogue',
        nextNodeId: 's1_end2'
      },
      's1_end': {
        id: 's1_end',
        name: 'System',
        text: 'Connection terminated manually.',
        type: 'narration',
        nextNodeId: null
      },
      's1_end2': {
        id: 's1_end2',
        name: 'System',
        text: 'Signal lost. Trace failed.',
        type: 'narration',
        nextNodeId: null
      }
    }
  }
];
