import { TagApi } from '@/models';
import { FlatList, StyleSheet } from 'react-native';
import { Button, Chip, useTheme } from 'react-native-paper';
import Container from '@/app/components/Container';

export type TagListProps = {
  tags: TagApi[];
  onAdd: () => void;
};

export default function TagList(props: TagListProps) {
  const theme = useTheme();
  return (
    <Container
      style={{
        borderRadius: theme.roundness,
        paddingBottom: 5,
      }}>
      <FlatList
        numColumns={3}
        columnWrapperStyle={{ marginBottom: 6 }}
        data={props.tags}
        renderItem={({ item }) => (
          // TODO https://www.geeksforgeeks.org/how-to-implement-drag-and-drop-functionality-in-react-native/
          <Chip style={styles.tag} icon={'tag'} testID={item.title}>
            {item.title}
          </Chip>
        )}
      />
      <Button icon={'tag-plus'} onPress={props.onAdd}>
        Add Tag
      </Button>
    </Container>
  );
}

const styles = StyleSheet.create({
  tag: {
    marginLeft: 10,
  },
});
