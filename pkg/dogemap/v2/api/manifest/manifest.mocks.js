export function generateManifests(input) {
  const randomChoice = (choices) => choices[Math.floor(Math.random() * choices.length)];

  const fieldLabels = {
    number: 'Number',
    text: 'Text',
    select: 'Select',
    toggle: 'Toggle',
    checkbox: 'Checkbox',
    radioButton: 'RadioButton',
    radio: 'Radio',
    range: 'Range',
    date: 'Date',
    // rating: 'Rating',
    color: 'Color',
    textarea: 'Textarea',
  };

  const generateRandomConfig = () => {
    const sectionNames = ['Identity', 'Connection'];
    const fields = Object.keys(fieldLabels);
    const options = {
      select: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
      ],
      radio: [
        { label: 'Burger', value: 'burger' },
        { label: 'Nuggets', value: 'nuggets' },
        { label: 'Fries', value: 'fries' },
      ],
      radioButton: [
        { label: 'Orange', value: 'orange' },
        { label: 'Lemon', value: 'lemon' },
        { label: 'Lime', value: 'lime' },
      ]
    };

    // We have 12 field types.
    // We're going to generate a form that has 2 sections
    // with half the fields in the first section, half in the other.
    const halfFieldCount = Math.ceil(fields.length / 2);

    return {
      sections: sectionNames.map((sectionName, sectionIndex) => {
        const sliceStartIndex = sectionIndex * halfFieldCount;
        const sliceEndIndex = sliceStartIndex + halfFieldCount;
        return {
          name: sectionName,
          fields: fields.slice(sliceStartIndex, sliceEndIndex)
            .map((field, fieldIndex) => ({
            label: fieldLabels[field],
            name: `${field}_${sectionIndex}_${fieldIndex}`,
            type: field,
            ...(field === 'checkbox' || field === 'toggle' || field === 'rating' ? { required: false } : { required: randomChoice([true, true]) }),
            ...(field === 'select' || field === 'radio' || field === 'radioButton' ? { options: [...options[field]] } : {}),
            ...(field === 'range' ? { min: 1, max: 69, step: 1 } : {})
          }))
          }
      })
    };
  };

  const randomSemver = () => `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;

  const names = Array.isArray(input) ? input : Array.from({ length: input }, (_, index) => `Package_${index + 1}`);

  const produce = (array) => array.map(name => ({
    id: name,
    package: name,
    version: randomSemver(),
    hash: Math.random().toString(36).substring(2, 15),
    docs: mockDocs[name] || mockDocs.lorem,
    command: {
      path: `/path/to/${name}`,
      args: '',
      cwd: `/current/working/directory/${name}`,
      env: null,
      config: generateRandomConfig(),
      configFiles: null,
    },
    gui: produceGuiSegment(name)
  }));

  // 'Mock a hardcoded set'
  if (!input) {
    return {
      internal: {
        id: "internal",
        label: "Internal",
        url: "",
        lastUpdated: "2024-04-12T12:02:49.956991+10:00",
        available: produce(['Dogeboxd']),
      },
      local: {
        id: "local",
        label: "Local Filesystem",
        url: "",
        lastUpdated: "2024-04-12T12:02:49.956055+10:00",
        available: produce(['Core', 'Identity', 'GigaWallet', 'ShibeShop', 'Map'])
      }
    };
  }

  // Mock a dynamic set that considers the input.
  return {
    local: {
      available: produce(names),
    }
  };
}

const produceGuiSegment = (pupName) => {
  if (pupName === 'Map') {
    return {
      source: 'http://map.pup.dogebox.local:9090'
    }
  }
}

const mockDocs = {
  GigaWallet: {
    about: `<h1>GigaWallet</h1>
      <h2>The Ultimate Dogecoin Payment Solution</h2>
      <p>Introducing GigaWallet, a powerful backend service that enables seamless integration of Dogecoin transactions into your application. With GigaWallet, online stores, exchanges, and social media platforms can easily incorporate Dogecoin payments, providing users with a convenient and secure payment option.</p>
      `
  },
  lorem: {
    about: `<h1>Such Package</h1>
      <h2>Much useful</h2>
      <p>In esse do tempor commodo cupidatat ullamco deserunt deserunt dolore ullamco consectetur et esse incididunt do ad veniam fugiat non pariatur nulla cillum laborum tempor excepteur. Laquis dolore et mollit est aliqua velit dolor id magna tempor sed ex irure eu officia proident sed aliqua nisi ut dolor excepteur adipisicing reprehenderit excepteur dolor laborum proident voluptate quis.</p>
      <p>Labore eiusmod anim do culpa non reprehenderit do sint anim proident aliqua do commodo dolore reprehenderit dolor fugiat elit irure enim mollit ut magna in tempor ex pariatur ullamco</p>`
  }
}