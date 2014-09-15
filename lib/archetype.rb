class Archetype
  include ActiveModel::Serialization

  attr_accessor :id, :options

  def initialize(id, options=nil)
    @id = id
    @options = options || {}
  end

  def attributes
    {
      id: @id,
      options: @options
    }
  end

  def self.default
    'regular'
  end

  def self.private_message
    'private_message'
  end

  def self.banner
    'banner'
  end

  def self.capable(cap)
    @capabilities[cap] || []
  end

  def self.not_capable(cap)
    are_capable = capable(cap)
    self.list.reject { |arch| are_capable.include? arch }
  end

  def self.is_capable?(name, cap)
    return capable(cap).include? name
  end

  def self.list
    return [] unless @archetypes.present?
    @archetypes.values
  end

  def self.get_archetype(name)
    @archetypes[name]
  end

  def self.register_capability(capability, name)
    @capabilities ||= {}
    @capabilities[capability] = [] unless @capabilities.has_key? capability
    @capabilities[capability] << name unless @capabilities[capability].include? name
  end

  def self.register(name, options={})
    @archetypes ||= {}
    archetype = options[:archetype] || Archetype.new(name, options)
    @archetypes[name] = archetype
    if archetype.options.has_key? :capabilities
      archetype.options[:capabilities].each do |cap|
        register_capability(cap, name)
      end
    end
  end

  def handle_topic_creation(topic_creator)
    self
  end

  # By default we have a regular archetype
  register 'regular', capabilities: [:searchable, :shown_publicly, :linkable, :creatible]
  register 'banner', capabilities: [:shown_publicly]

end

# and a private message
class PrivateMessageArchetype < Archetype

  def handle_topic_creation(topic_creator)
    topic_creator.topic.subtype = TopicSubtype.user_to_user unless topic_creator.topic.subtype

    unless topic_creator.opts[:target_usernames].present? || topic_creator.opts[:target_group_names].present?
      topic_creator.topic.errors.add(:archetype, :cant_send_pm)
      topic_creator.errors = topic_creator.topic.errors
      raise ActiveRecord::Rollback.new
    end

    add_users(topic_creator.topic, topic_creator.opts[:target_usernames])
    add_groups(topic_creator.topic, topic_creator.opts[:target_group_names])
    topic_creator.topic.topic_allowed_users.build(user_id: topic_creator.user.id)
  end

  private
    def add_users(topic_creator, usernames)
      return unless usernames
      User.where(username: usernames.split(',')).each do |user|
        check_can_send_permission!(topic_creator, user)
        topic_creator.topic.topic_allowed_users.build(user_id: user.id)
      end
    end

    def add_groups(topic_creator, groups)
      return unless groups
      Group.where(name: groups.split(',')).each do |group|
        check_can_send_permission!(topic_creator, group)
        topic_creator.topic.topic_allowed_groups.build(group_id: group.id)
      end
    end

    def check_can_send_permission!(topic_creator, item)
      unless topic_creator.guardian.can_send_private_message?(item)
        topic_creator.topic.errors.add(:archetype, :cant_send_pm)
        topic_creator.errors = topic_creator.topic.errors
        raise ActiveRecord::Rollback.new
      end
    end
end

Archetype.register("private_message", {archetype: PrivateMessageArchetype.new("private_message")})