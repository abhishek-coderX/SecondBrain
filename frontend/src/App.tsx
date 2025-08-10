import { Cards } from "./components/Cards";
import { PlusIcon } from "./components/icons/PlusIcon";
import { ShareIcon } from "./components/icons/ShareIcon";
import { Button } from "./components/ui/Button";

const App = () => {
  return (
    <div>
      <Button
        size="md"
        variant="primary"
        text="add content"
        startIcon={<PlusIcon size="sm" />}
      />
      <Button
        size="md"
        variant="secondary"
        text=" content"
        startIcon={<ShareIcon size="sm" />}
      />
      <Cards
        title="ho to be bellionaire"
        tags={["rich", "mindset"]}
        link="https://www.youtube.com/watch?v=O8WIdjRk10o"
        type="youtube"
        description="Dan Abramov shares essential React patterns that "
        dateAdded="08/03/2024"
        author="abhishek"
        
        
      />

      <Cards
      title="The Future of Web Development"
      link="https://publish.twitter.com/?url=https://twitter.com/ellie_Jones_AI/status/1954122545201824246#"
      type="twitter"

      
      />

      <Cards
  // --- Article Example ---
  title="An In-Depth Look at Modern Web Development"
  link="https://medium.com/enlightenment-of-asia/the-beauty-beyond-the-tragedy-of-the-summer-hikaru-died-3408b4f133c8"
  type="article"
  description="This article explores the latest trends, frameworks, and best practices shaping the future of the web."
  tags={["web-dev", "trends", "javascript"]}
  dateAdded="10/08/2025"
  author="Jane Doe"
  thumbnail="https://miro.medium.com/v2/resize:fit:1100/format:webp/0*3G3DRiCDWw4joQ9v"
/>

    </div>
  );
};

export default App;
